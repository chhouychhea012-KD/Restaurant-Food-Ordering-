const { ApiError } = require('../utils/http');

const terminalStatuses = new Set(['DELIVERED', 'COMPLETED', 'CANCELLED', 'REJECTED', 'REFUNDED']);

const allowedTransitions = {
  PLACED: ['ACCEPTED', 'PREPARING', 'CANCELLED', 'REJECTED'],
  ACCEPTED: ['PREPARING', 'CANCELLED', 'REJECTED'],
  PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['RIDER_ASSIGNED', 'PICKED_UP', 'CANCELLED'],
  RIDER_ASSIGNED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['ON_THE_WAY', 'DELIVERED'],
  ON_THE_WAY: ['DELIVERED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
  REFUNDED: [],
};

function roleName(user) {
  return user?.role || 'guest';
}

function isPlatformOperator(user) {
  return ['admin', 'operations_manager', 'support_agent'].includes(roleName(user));
}

function isRestaurantOperator(user) {
  return ['owner', 'branch_manager', 'kitchen'].includes(roleName(user));
}

function assertRestaurantScope(user, order) {
  if (!user?.restaurantId || user.restaurantId !== order.restaurantId) {
    throw new ApiError(403, 'This order belongs to another restaurant.');
  }
}

function assertCanReadOrder(user, order) {
  if (isPlatformOperator(user)) return;
  if (roleName(user) === 'customer' && order.customerId === user.id) return;
  if (isRestaurantOperator(user)) {
    assertRestaurantScope(user, order);
    return;
  }
  if (roleName(user) === 'rider') {
    if (order.riderName === user.name || (!order.riderName && order.status === 'READY_FOR_PICKUP')) return;
  }
  throw new ApiError(403, 'You cannot access this order.');
}

function assertCanCreateOrder(user, payload) {
  if (roleName(user) !== 'customer') {
    throw new ApiError(403, 'Only customers can create checkout orders.');
  }
  if (payload.customerId && payload.customerId !== user.id) {
    throw new ApiError(403, 'Customers can only create orders for their own account.');
  }
}

function assertCanMutateOrder(user, order, nextStatus) {
  if (isPlatformOperator(user)) return;

  if (['owner', 'branch_manager'].includes(roleName(user))) {
    assertRestaurantScope(user, order);
    return;
  }

  if (roleName(user) === 'kitchen') {
    assertRestaurantScope(user, order);
    if (!['ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].includes(nextStatus)) {
      throw new ApiError(403, 'Kitchen can only accept, prepare, and mark orders ready for pickup.');
    }
    return;
  }

  if (roleName(user) === 'rider') {
    if (!['PICKED_UP', 'ON_THE_WAY', 'DELIVERED'].includes(nextStatus)) {
      throw new ApiError(403, 'Delivery riders can only update pickup, on-the-way, and delivered progress.');
    }
    if (order.riderName && order.riderName !== user.name) {
      throw new ApiError(403, 'This delivery is assigned to another rider.');
    }
    if (!order.riderName && order.status !== 'READY_FOR_PICKUP') {
      throw new ApiError(403, 'This order is not ready for rider pickup.');
    }
    return;
  }

  throw new ApiError(403, 'You cannot update this order.');
}

function assertValidStatusTransition(currentStatus, nextStatus) {
  if (!nextStatus || currentStatus === nextStatus) return;
  const allowed = allowedTransitions[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    if (terminalStatuses.has(currentStatus)) {
      throw new ApiError(409, 'This order is already closed and cannot be changed.');
    }
    throw new ApiError(409, 'Invalid order status transition from ' + currentStatus + ' to ' + nextStatus + '.');
  }
}

function validateCreatePayload(payload) {
  const issues = [];
  if (!payload.restaurantId) issues.push('Restaurant is required.');
  if (!payload.restaurantName) issues.push('Restaurant name is required.');
  if (!payload.deliveryAddress) issues.push('Delivery address is required.');
  if (!Array.isArray(payload.items) || payload.items.length === 0) issues.push('At least one order item is required.');

  const subtotal = Number(payload.subtotal);
  const deliveryFee = Number(payload.deliveryFee);
  const discount = Number(payload.discount || 0);
  if (!Number.isFinite(subtotal) || subtotal < 0) issues.push('Subtotal must be a valid amount.');
  if (!Number.isFinite(deliveryFee) || deliveryFee < 0) issues.push('Delivery fee must be a valid amount.');
  if (!Number.isFinite(discount) || discount < 0) issues.push('Discount must be a valid amount.');

  (payload.items || []).forEach((item, index) => {
    if (!item.name) issues.push('Item #' + (index + 1) + ' name is required.');
    if (!Number.isFinite(Number(item.quantity)) || Number(item.quantity) < 1) issues.push('Item #' + (index + 1) + ' quantity must be at least 1.');
    if (!Number.isFinite(Number(item.price)) || Number(item.price) < 0) issues.push('Item #' + (index + 1) + ' price must be valid.');
  });

  if (issues.length) {
    throw new ApiError(422, issues.join(' '));
  }
}

module.exports = {
  assertCanCreateOrder,
  assertCanMutateOrder,
  assertCanReadOrder,
  assertValidStatusTransition,
  validateCreatePayload,
};
