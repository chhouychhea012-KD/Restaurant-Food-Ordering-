const { Op } = require('sequelize');
const { Order, OrderItem, OrderTimeline } = require('../models');
const { ApiError, created, noContent, ok } = require('../utils/http');
const { serializeOrder } = require('../services/serializer.service');
const workflow = require('../services/workflow.service');

const includeOrder = [
  { model: OrderItem, as: 'items' },
  { model: OrderTimeline, as: 'timeline' },
];

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
  if (req.query.customerId) {
    where.customerId = req.query.customerId;
  }
  if (req.query.restaurantId) {
    where.restaurantId = req.query.restaurantId;
  }
  if (req.query.riderName) {
    where[Op.or] = [{ riderName: req.query.riderName }, { status: 'RIDER_ASSIGNED' }];
  }
  const orders = await Order.findAll({ where, include: includeOrder, order: [['createdAt', 'DESC']] });
  return ok(res, orders.map(serializeOrder));
}

async function show(req, res) {
  const order = await Order.findByPk(req.params.id, { include: includeOrder });
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  return ok(res, serializeOrder(order));
}

async function create(req, res) {
  const count = await Order.count();
  const id = `ord-${String(count + 1).padStart(3, '0')}`;
  const total = Number(req.body.subtotal) + Number(req.body.deliveryFee) - Number(req.body.discount || 0);
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
    paymentMethod: req.body.paymentMethod,
    paymentSummary: req.body.paymentSummary || paymentSummary(req.body.paymentMethod, req.body.paymentDetails),
    deliveryInstructions: req.body.deliveryInstructions || '',
    voucherCode: req.body.voucherCode || null,
    loyaltyPointsRedeemed: req.body.loyaltyPointsRedeemed || 0,
  });
  await OrderItem.bulkCreate(
    (req.body.items || []).map((item) => ({
      id: item.id,
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
  await order.update({
    status: req.body.status || order.status,
    riderName: req.body.riderName === undefined ? order.riderName : req.body.riderName,
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
