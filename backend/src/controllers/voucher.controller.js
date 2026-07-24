const crypto = require('crypto');
const { Op } = require('sequelize');
const { Notification, Restaurant, RoleAssignment, Voucher, sequelize } = require('../models');
const { ApiError, created, noContent, ok } = require('../utils/http');
const { serializeVoucher } = require('../services/serializer.service');
const workflow = require('../services/workflow.service');

const includeVoucher = [{ model: Restaurant, as: 'restaurant' }];
const manageableRoles = ['admin', 'owner'];

function normalizeCode(code) {
  return String(code || '').trim().toUpperCase().replace(/\s+/g, '');
}

function dateOrNull(value) {
  return value ? new Date(value) : null;
}

async function assignedRestaurantIds(user) {
  const ids = new Set();
  if (user.restaurantId) ids.add(user.restaurantId);
  const assignments = await RoleAssignment.findAll({ where: { userId: user.id } });
  assignments.forEach((assignment) => {
    const values = Array.isArray(assignment.restaurantIds) ? assignment.restaurantIds : [];
    values.forEach((id) => id && ids.add(id));
  });
  return [...ids];
}

async function scopedWhere(req) {
  if (req.user.role === 'admin') {
    return {};
  }

  const restaurantIds = await assignedRestaurantIds(req.user);
  if (!restaurantIds.length) {
    return { id: null };
  }
  return { restaurantId: { [Op.in]: restaurantIds } };
}

async function ensureCanManage(req, voucher) {
  if (!manageableRoles.includes(req.user.role)) {
    throw new ApiError(403, 'Only platform admins and restaurant owners can manage vouchers.');
  }
  if (req.user.role === 'admin') {
    return;
  }
  const restaurantIds = await assignedRestaurantIds(req.user);
  if (!voucher.restaurantId || !restaurantIds.includes(voucher.restaurantId)) {
    throw new ApiError(403, 'Restaurant owners can only manage vouchers for their assigned restaurant.');
  }
}

async function buildPayload(req, existing = null) {
  const code = normalizeCode(req.body.code ?? existing?.code);
  if (!code) throw new ApiError(422, 'Voucher code is required.');
  const title = String(req.body.title ?? existing?.title ?? '').trim();
  if (!title) throw new ApiError(422, 'Voucher title is required.');
  const discountType = req.body.discountType ?? existing?.discountType ?? 'fixed';
  if (!['percentage', 'fixed', 'free_delivery'].includes(discountType)) {
    throw new ApiError(422, 'Discount type is invalid.');
  }

  const restaurantId = req.body.restaurantId === '' ? null : req.body.restaurantId ?? existing?.restaurantId ?? null;
  if (req.user.role === 'owner') {
    const restaurantIds = await assignedRestaurantIds(req.user);
    if (!restaurantId || !restaurantIds.includes(restaurantId)) {
      throw new ApiError(403, 'Restaurant owners must choose one of their assigned restaurants.');
    }
  }

  return {
    code,
    title,
    description: req.body.description ?? existing?.description ?? null,
    discountType,
    discountValue: discountType === 'free_delivery' ? 0 : Number(req.body.discountValue ?? existing?.discountValue ?? 0),
    minSubtotal: Number(req.body.minSubtotal ?? existing?.minSubtotal ?? 0),
    maxDiscount: req.body.maxDiscount === '' || req.body.maxDiscount === null ? null : req.body.maxDiscount === undefined ? existing?.maxDiscount ?? null : Number(req.body.maxDiscount),
    usageLimit: req.body.usageLimit === '' || req.body.usageLimit === null ? null : req.body.usageLimit === undefined ? existing?.usageLimit ?? null : Number(req.body.usageLimit),
    startsAt: req.body.startsAt === '' ? null : req.body.startsAt === undefined ? existing?.startsAt ?? null : dateOrNull(req.body.startsAt),
    endsAt: req.body.endsAt === '' ? null : req.body.endsAt === undefined ? existing?.endsAt ?? null : dateOrNull(req.body.endsAt),
    active: req.body.active === undefined ? existing?.active ?? true : Boolean(req.body.active),
    restaurantId,
  };
}

function calculateDiscount(voucher, subtotal, deliveryFee) {
  if (voucher.discountType === 'free_delivery') return Math.max(0, Number(deliveryFee || 0));
  if (voucher.discountType === 'percentage') {
    const raw = Math.max(0, Number(subtotal || 0) * (Number(voucher.discountValue || 0) / 100));
    return voucher.maxDiscount ? Math.min(raw, Number(voucher.maxDiscount)) : raw;
  }
  return Math.min(Math.max(0, Number(voucher.discountValue || 0)), Math.max(0, Number(subtotal || 0)));
}

function validateVoucher(voucher, { subtotal, deliveryFee, restaurantId }) {
  const now = new Date();
  if (!voucher) return { valid: false, message: 'Voucher code not recognized.', discount: 0 };
  if (!voucher.active) return { valid: false, message: 'This voucher is not active.', discount: 0 };
  if (voucher.restaurantId && restaurantId && voucher.restaurantId !== restaurantId) return { valid: false, message: 'This voucher is not available for this restaurant.', discount: 0 };
  if (voucher.startsAt && new Date(voucher.startsAt) > now) return { valid: false, message: 'This voucher is not active yet.', discount: 0 };
  if (voucher.endsAt && new Date(voucher.endsAt) < now) return { valid: false, message: 'This voucher has expired.', discount: 0 };
  if (voucher.usageLimit !== null && voucher.usageLimit !== undefined && Number(voucher.usedCount || 0) >= Number(voucher.usageLimit)) return { valid: false, message: 'This voucher has reached its usage limit.', discount: 0 };
  if (Number(subtotal || 0) < Number(voucher.minSubtotal || 0)) return { valid: false, message: `This voucher needs a subtotal of at least ${Number(voucher.minSubtotal).toFixed(2)}.`, discount: 0 };

  const discount = calculateDiscount(voucher, subtotal, deliveryFee);
  if (discount <= 0) return { valid: false, message: 'This voucher does not apply to the current cart.', discount: 0 };
  return { valid: true, message: `${voucher.code} applied to the current cart.`, discount };
}

async function available(req, res) {
  const now = new Date();
  const restaurantId = req.query.restaurantId || null;
  const where = {
    active: true,
    [Op.and]: [
      { [Op.or]: [{ startsAt: null }, { startsAt: { [Op.lte]: now } }] },
      { [Op.or]: [{ endsAt: null }, { endsAt: { [Op.gte]: now } }] },
      { [Op.or]: [{ usageLimit: null }, { usedCount: { [Op.lt]: sequelize.col('usage_limit') } }] },
    ],
  };

  if (restaurantId) {
    where[Op.or] = [{ restaurantId: null }, { restaurantId }];
  } else {
    where.restaurantId = null;
  }

  const vouchers = await Voucher.findAll({ where, include: includeVoucher, order: [['minSubtotal', 'ASC'], ['createdAt', 'DESC']] });
  return ok(res, vouchers.map(serializeVoucher));
}
async function list(req, res) {
  const where = await scopedWhere(req);
  if (req.query.restaurantId) where.restaurantId = req.query.restaurantId;
  const vouchers = await Voucher.findAll({ where, include: includeVoucher, order: [['createdAt', 'DESC']] });
  return ok(res, vouchers.map(serializeVoucher));
}

async function show(req, res) {
  const voucher = await Voucher.findByPk(req.params.id, { include: includeVoucher });
  if (!voucher) throw new ApiError(404, 'Voucher not found.');
  await ensureCanManage(req, voucher);
  return ok(res, serializeVoucher(voucher));
}

async function create(req, res) {
  const payload = await buildPayload(req);
  const duplicate = await Voucher.findOne({ where: { code: payload.code } });
  if (duplicate) throw new ApiError(409, 'This voucher code already exists.');
  const voucher = await Voucher.create({ id: `voucher-${crypto.randomUUID()}`, ...payload, createdBy: req.user.id });
  await workflow.createActivity(req, { domain: 'promotion', action: 'voucher.created', title: 'Voucher created: ' + voucher.code, description: voucher.title + ' was created for customer checkout.', restaurantId: voucher.restaurantId, metadata: { voucherId: voucher.id, code: voucher.code, discountType: voucher.discountType } });
  const fullVoucher = await Voucher.findByPk(voucher.id, { include: includeVoucher });
  return created(res, serializeVoucher(fullVoucher));
}


async function createPromoEvent(req, res) {
  const payload = await buildPayload(req);
  const duplicate = await Voucher.findOne({ where: { code: payload.code } });
  if (duplicate) throw new ApiError(409, 'This voucher code already exists.');

  const voucher = await Voucher.create({ id: `voucher-${crypto.randomUUID()}`, ...payload, createdBy: req.user.id });
  const fullVoucher = await Voucher.findByPk(voucher.id, { include: includeVoucher });
  const restaurantName = fullVoucher.restaurant?.name;
  const scheduledAt = req.body.notification?.scheduledAt || req.body.scheduledAt || null;
  const notificationTitle = String(req.body.notification?.title || payload.title || `Promo code ${voucher.code}`).trim();
  const fallbackMessage = `${restaurantName ? `${restaurantName}: ` : ''}Use promo code ${voucher.code} on your next order. ${payload.description || ''}`.trim();
  const notificationMessage = String(req.body.notification?.message || fallbackMessage).trim();

  const notification = await Notification.create({
    id: `notif-${crypto.randomUUID()}`,
    title: notificationTitle,
    message: notificationMessage,
    kind: 'promo',
    audienceRole: 'customer',
    userId: null,
    ctaLabel: req.body.notification?.ctaLabel || 'Use promo code',
    ctaTo: req.body.notification?.ctaTo || '/cart',
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
  });

  await workflow.createActivity(req, {
    domain: 'promotion',
    action: 'voucher.promo_event.created',
    title: 'Promo event created: ' + voucher.code,
    description: scheduledAt ? `${voucher.code} is scheduled for customer notification.` : `${voucher.code} was sent to customers.`,
    restaurantId: voucher.restaurantId,
    metadata: { voucherId: voucher.id, notificationId: notification.id, code: voucher.code, scheduledAt },
  });

  return created(res, {
    voucher: serializeVoucher(fullVoucher),
    notificationId: notification.id,
    scheduledAt: notification.scheduledAt,
  });
}
async function update(req, res) {
  const voucher = await Voucher.findByPk(req.params.id, { include: includeVoucher });
  if (!voucher) throw new ApiError(404, 'Voucher not found.');
  await ensureCanManage(req, voucher);
  const payload = await buildPayload(req, voucher);
  const duplicate = await Voucher.findOne({ where: { code: payload.code, id: { [Op.ne]: voucher.id } } });
  if (duplicate) throw new ApiError(409, 'This voucher code already exists.');
  await voucher.update(payload);
  await workflow.createActivity(req, { domain: 'promotion', action: 'voucher.updated', title: 'Voucher updated: ' + voucher.code, description: voucher.title + ' was updated.', restaurantId: voucher.restaurantId, metadata: { voucherId: voucher.id, code: voucher.code, active: Boolean(voucher.active) } });
  const fullVoucher = await Voucher.findByPk(voucher.id, { include: includeVoucher });
  return ok(res, serializeVoucher(fullVoucher));
}

async function remove(req, res) {
  const voucher = await Voucher.findByPk(req.params.id);
  if (!voucher) throw new ApiError(404, 'Voucher not found.');
  await ensureCanManage(req, voucher);
  await workflow.createActivity(req, { domain: 'promotion', action: 'voucher.deleted', title: 'Voucher deleted: ' + voucher.code, description: voucher.title + ' was removed from checkout.', restaurantId: voucher.restaurantId, metadata: { voucherId: voucher.id, code: voucher.code } });
  await voucher.destroy();
  return noContent(res);
}

async function validate(req, res) {
  const code = normalizeCode(req.body.code || req.query.code);
  const subtotal = Number(req.body.subtotal ?? req.query.subtotal ?? 0);
  const deliveryFee = Number(req.body.deliveryFee ?? req.query.deliveryFee ?? 0);
  const restaurantId = req.body.restaurantId || req.query.restaurantId || null;
  const voucher = await Voucher.findOne({ where: { code }, include: includeVoucher });
  const result = validateVoucher(voucher, { subtotal, deliveryFee, restaurantId });
  return ok(res, { ...result, voucher: result.valid ? serializeVoucher(voucher) : null });
}

module.exports = {
  available,
  create,
  createPromoEvent,
  list,
  remove,
  show,
  update,
  validate,
};
