const { Op } = require('sequelize');
const { Order, OrderItem, OrderTimeline, Voucher } = require('../models');
const { ApiError, created, noContent, ok } = require('../utils/http');
const { serializeOrder } = require('../services/serializer.service');
const workflow = require('../services/workflow.service');
const orderPolicy = require('../services/order-policy.service');

const includeOrder = [
  { model: OrderItem, as: 'items' },
  { model: OrderTimeline, as: 'timeline' },
];

const allowedPaymentMethods = ['cash', 'visa_card', 'bank_account', 'paypal', 'aba_payway', 'card_mock', 'wallet_mock'];

function normalizePaymentMethod(method) {
  return allowedPaymentMethods.includes(method) ? method : null;
}

function paymentDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function validatePaymentDetails(method, details = {}) {
  const issues = [];
  if (!method) {
    issues.push('Choose a valid payment method.');
    return issues;
  }
  if (method === 'cash') return issues;

  if (method === 'visa_card' || method === 'card_mock') {
    if (details.accountName && String(details.accountName).trim().length < 3) issues.push('Enter the cardholder name.');
    const last4 = paymentDigits(details.last4);
    if (last4 && last4.length !== 4) issues.push('Enter valid card details.');
  }
  if (method === 'bank_account' || method === 'wallet_mock') {
    if (details.bankName !== undefined && !String(details.bankName).trim()) issues.push('Choose a bank.');
    const last4 = paymentDigits(details.last4);
    if (last4 && last4.length !== 4) issues.push('Enter valid bank account details.');
  }
  if (method === 'paypal' && details.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(details.email).trim())) {
    issues.push('Enter a valid PayPal email address.');
  }
  if (method === 'aba_payway') {
    if (details.accountName && String(details.accountName).trim().length < 3) issues.push('Enter the ABA account name.');
    const phoneLast4 = paymentDigits(details.phoneLast4);
    if (phoneLast4 && phoneLast4.length !== 4) issues.push('Enter valid ABA PayWay phone details.');
  }
  return issues;
}

async function nextOrderId() {
  const count = await Order.count();
  for (let index = count + 1; index < count + 10000; index += 1) {
    const id = `ord-${String(index).padStart(3, '0')}`;
    const existing = await Order.findByPk(id);
    if (!existing) return id;
  }
  return `ord-${Date.now()}`;
}

function paymentSummary(method, details = {}) {
  if (method === 'visa_card' || method === 'card_mock') return 'Visa ending ' + (details.last4 || 'demo');
  if (method === 'bank_account' || method === 'wallet_mock') return (details.bankName || 'Bank account') + ' ending ' + (details.last4 || 'demo');
  if (method === 'paypal') return 'PayPal ' + (details.email || 'demo account');
  if (method === 'aba_payway') return 'ABA PayWay ending ' + (details.phoneLast4 || 'demo');
  return 'Cash on delivery';
}

function timelineTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function statusLabel(status) {
  return String(status)
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

async function list(req, res) {
  const where = {};
  if (req.user.role === 'customer') {
    where.customerId = req.user.id;
  } else if (['owner', 'branch_manager', 'kitchen'].includes(req.user.role)) {
    where.restaurantId = req.user.restaurantId;
  } else if (req.query.customerId) {
    where.customerId = req.query.customerId;
  }

  if (!['customer', 'owner', 'branch_manager', 'kitchen'].includes(req.user.role) && req.query.restaurantId) {
    where.restaurantId = req.query.restaurantId;
  }

  if (req.query.riderName || req.user.role === 'rider') {
    const riderName = req.user.role === 'rider' ? req.user.name : req.query.riderName;
    where[Op.or] = [
      { riderName },
      { riderName: null, status: 'READY_FOR_PICKUP' },
    ];
  }
  const orders = await Order.findAll({ where, include: includeOrder, order: [['createdAt', 'DESC']] });
  return ok(res, orders.map(serializeOrder));
}

async function show(req, res) {
  const order = await Order.findByPk(req.params.id, { include: includeOrder });
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  orderPolicy.assertCanReadOrder(req.user, order);
  return ok(res, serializeOrder(order));
}

async function create(req, res) {
  orderPolicy.assertCanCreateOrder(req.user, req.body);
  orderPolicy.validateCreatePayload(req.body);
  const id = await nextOrderId();
  const paymentMethod = normalizePaymentMethod(req.body.paymentMethod);
  const paymentIssues = validatePaymentDetails(paymentMethod, req.body.paymentDetails || {});
  if (paymentIssues.length) {
    throw new ApiError(422, paymentIssues.join(' '));
  }
  const total = Math.max(0, Number(req.body.subtotal) + Number(req.body.deliveryFee) - Number(req.body.discount || 0));
  const order = await Order.create({
    id,
    customerId: req.body.customerId || req.user.id,
    restaurantId: req.body.restaurantId,
    restaurantName: req.body.restaurantName,
    branchId: req.body.branchId,
    branchName: req.body.branchName,
    status: 'PLACED',
    estimatedDeliveryAt: new Date(Date.now() + 35 * 60 * 1000),
    deliveryAddress: req.body.deliveryAddress,
    subtotal: req.body.subtotal,
    deliveryFee: req.body.deliveryFee,
    discount: req.body.discount || 0,
    total,
    riderName: null,
    paymentMethod,
    paymentSummary: req.body.paymentSummary || paymentSummary(paymentMethod, req.body.paymentDetails),
    deliveryInstructions: req.body.deliveryInstructions || '',
    voucherCode: req.body.voucherCode || null,
    loyaltyPointsRedeemed: req.body.loyaltyPointsRedeemed || 0,
  });
  await OrderItem.bulkCreate(
    (req.body.items || []).map((item, index) => ({
      id: `${order.id}-item-${index + 1}-${item.menuItemId || item.id}`,
      orderId: order.id,
      menuItemId: item.menuItemId || item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      modifiers: item.modifiers || [],
      note: item.note || '',
    })),
  );
  await OrderTimeline.create({ orderId: order.id, status: 'PLACED', label: 'Order placed', time: timelineTime() });
  if (order.voucherCode) {
    const voucher = await Voucher.findOne({ where: { code: String(order.voucherCode).toUpperCase() } });
    if (voucher) {
      await voucher.increment('usedCount');
    }
  }
  await workflow.orderCreated(req, order, (req.body.items || []).length);
  const fullOrder = await Order.findByPk(order.id, { include: includeOrder });
  return created(res, serializeOrder(fullOrder));
}

async function update(req, res) {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  const previousOrder = order.get({ plain: true });
  const previousStatus = order.status;
  let nextStatus = req.body.status || order.status;
  let nextRiderName = req.body.riderName === undefined ? order.riderName : req.body.riderName;

  orderPolicy.assertCanMutateOrder(req.user, order, nextStatus);
  orderPolicy.assertValidStatusTransition(order.status, nextStatus);

  if (req.user?.role === 'rider') {
    nextRiderName = req.user.name;
  }

  await order.update({
    status: nextStatus,
    riderName: nextRiderName,
    estimatedDeliveryAt: req.body.estimatedDeliveryAt || order.estimatedDeliveryAt,
  });
  if (previousStatus !== order.status) {
    await OrderTimeline.create({ orderId: order.id, status: order.status, label: req.body.label || statusLabel(order.status), time: timelineTime() });
  }
  await workflow.orderUpdated(req, previousOrder, order);
  const fullOrder = await Order.findByPk(order.id, { include: includeOrder });
  return ok(res, serializeOrder(fullOrder));
}

async function updateStatus(req, res) {
  req.body.status = req.body.status || req.params.status;
  return update(req, res);
}

async function approveRefund(req, res) {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  orderPolicy.assertCanReadOrder(req.user, order);
  const reason = req.body.reason || 'Approved by admin';
  await order.update({
    refundStatus: 'APPROVED',
    refundApprovedAt: new Date(),
    refundReason: reason,
  });
  await workflow.refundApproved(req, order, reason);
  const fullOrder = await Order.findByPk(order.id, { include: includeOrder });
  return ok(res, serializeOrder(fullOrder));
}

async function remove(req, res) {
  const order = await Order.findByPk(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  orderPolicy.assertCanMutateOrder(req.user, order, 'CANCELLED');
  await workflow.createActivity(req, {
    domain: 'order',
    action: 'order.deleted',
    title: 'Deleted ' + order.id,
    description: order.restaurantName + ' removed ' + order.id + ' from the order dataset.',
    restaurantId: order.restaurantId,
    restaurantName: order.restaurantName,
    orderId: order.id,
    metadata: { status: order.status, total: Number(order.total) },
  });
  await order.destroy();
  return noContent(res);
}

module.exports = {
  approveRefund,
  create,
  list,
  remove,
  show,
  update,
  updateStatus,
};
