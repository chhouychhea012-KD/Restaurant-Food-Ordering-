const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { permissionCatalog } = require('../config/permissions');

const dataDir = path.resolve(__dirname, '..', '..', '..', 'frontend', 'src', 'assets', 'data');

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));
}

function timestamp(value) {
  return value ? new Date(value) : new Date();
}

function defaultOperatingHours() {
  return [
    { day: 0, label: 'Sun', open: '10:00', close: '21:00', closed: false },
    { day: 1, label: 'Mon', open: '10:00', close: '21:00', closed: false },
    { day: 2, label: 'Tue', open: '10:00', close: '21:00', closed: false },
    { day: 3, label: 'Wed', open: '10:00', close: '21:00', closed: false },
    { day: 4, label: 'Thu', open: '10:00', close: '21:00', closed: false },
    { day: 5, label: 'Fri', open: '10:00', close: '22:00', closed: false },
    { day: 6, label: 'Sat', open: '10:00', close: '22:00', closed: false },
  ];
}

function seedPassword(role) {
  const passwords = {
    admin: 'Admin@123',
    owner: 'Owner@123',
    kitchen: 'Kitchen@123',
    rider: 'Rider@123',
    customer: 'Customer@123',
  };
  return passwords[role] || 'Welcome@123';
}

function statusLabel(status) {
  return String(status)
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function roles() {
  return readJson('roles.json');
}

function users() {
  return readJson('users.json');
}

function restaurants() {
  return readJson('restaurants.json');
}

function orders() {
  return readJson('orders.json');
}

function notifications() {
  return readJson('notifications.json');
}

function analytics() {
  return readJson('analytics.json');
}

function permissionRows() {
  const now = new Date();
  return permissionCatalog.map((key) => ({ key, created_at: now, updated_at: now }));
}

function roleRows() {
  return roles().map((role) => ({
    id: role.id,
    name: role.name,
    label: role.label,
    description: role.description || null,
    is_system: Boolean(role.isSystem),
    created_at: timestamp(role.createdAt),
    updated_at: timestamp(role.updatedAt),
  }));
}

function rolePermissionRows() {
  const now = new Date();
  return roles().flatMap((role) => role.permissions.map((permissionKey) => ({ role_id: role.id, permission_key: permissionKey, created_at: now, updated_at: now })));
}

function restaurantRows() {
  return restaurants().map((restaurant) => ({
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    cuisine: JSON.stringify(restaurant.cuisine || []),
    description: restaurant.description || `${restaurant.name} is available for delivery.`,
    rating: restaurant.rating || 4.5,
    review_count: restaurant.reviewCount || Math.max(32, Math.round((restaurant.rating || 4.5) * 64)),
    delivery_time: restaurant.deliveryTime,
    delivery_fee: restaurant.deliveryFee,
    hero_color: restaurant.heroColor,
    cover_image: restaurant.coverImage,
    status: restaurant.status,
    verified: Boolean(restaurant.verified),
    partner_status: restaurant.partnerStatus || (restaurant.verified ? 'verified' : 'pending'),
    suspension_reason: restaurant.suspensionReason || null,
    commission_rate: restaurant.commissionRate || 0.18,
    created_at: timestamp(restaurant.createdAt),
    updated_at: timestamp(restaurant.updatedAt),
  }));
}

function branchRows() {
  const now = new Date();
  return restaurants().flatMap((restaurant) => restaurant.branches.map((branch, index) => ({
    id: branch.id,
    restaurant_id: restaurant.id,
    name: branch.name,
    zone: branch.zone,
    lat: branch.lat,
    lng: branch.lng,
    phone: branch.phone || `+855 12 000 ${String(index + 1).padStart(3, '0')}`,
    status: branch.status || 'open',
    average_prep_minutes: branch.averagePrepMinutes || 18,
    minimum_order_amount: branch.minimumOrderAmount || 150,
    created_at: now,
    updated_at: now,
  })));
}

function branchOperatingHourRows() {
  const now = new Date();
  return restaurants().flatMap((restaurant) => restaurant.branches.flatMap((branch) =>
    (branch.operatingHours && branch.operatingHours.length ? branch.operatingHours : defaultOperatingHours()).map((hour) => ({
      branch_id: branch.id,
      day: hour.day,
      label: hour.label,
      open: hour.open,
      close: hour.close,
      closed: Boolean(hour.closed),
      created_at: now,
      updated_at: now,
    })),
  ));
}

function holidayClosureRows() {
  const now = new Date();
  return restaurants().flatMap((restaurant) => restaurant.branches.flatMap((branch) =>
    (branch.holidayClosures || []).map((closure, index) => ({
      id: closure.id || `holiday-${branch.id}-${index}`,
      branch_id: branch.id,
      date: closure.date,
      label: closure.label,
      created_at: now,
      updated_at: now,
    })),
  ));
}

function menuCategoryRows() {
  const now = new Date();
  return restaurants().flatMap((restaurant) => restaurant.menuCategories.map((category) => ({
    id: category.id,
    restaurant_id: restaurant.id,
    name: category.name,
    created_at: now,
    updated_at: now,
  })));
}

function menuItemRows() {
  const now = new Date();
  return restaurants().flatMap((restaurant) => restaurant.menuCategories.flatMap((category) => category.items.map((item) => ({
    id: item.id,
    category_id: category.id,
    name: item.name,
    description: item.description,
    price: item.price,
    image: item.image,
    available: Boolean(item.available),
    prep_time: item.prepTime,
    modifiers: JSON.stringify(item.modifiers || []),
    created_at: now,
    updated_at: now,
  }))));
}

function userRows() {
  return users().map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    password_hash: bcrypt.hashSync(seedPassword(user.role), 12),
    role: user.role,
    status: user.status || 'active',
    phone: user.phone,
    avatar: user.avatar,
    avatar_url: user.avatarUrl || null,
    restaurant_id: user.restaurantId || null,
    shift_active: user.shiftActive !== false,
    loyalty_points: user.loyaltyPoints ?? null,
    created_at: timestamp(user.createdAt),
    updated_at: timestamp(user.updatedAt),
  }));
}

function roleAssignmentRows() {
  const now = new Date();
  const roleList = roles();
  return users().flatMap((user) => (user.roleAssignments || []).map((assignment, index) => ({
    id: assignment.id || `assignment-${user.id}-${index}`,
    user_id: user.id,
    role_id: assignment.roleId || roleList.find((role) => role.name === assignment.roleName)?.id || null,
    role_name: assignment.roleName,
    restaurant_ids: JSON.stringify(assignment.restaurantIds || (user.restaurantId ? [user.restaurantId] : [])),
    branch_ids: JSON.stringify(assignment.branchIds || []),
    access_window: assignment.accessWindow ? JSON.stringify(assignment.accessWindow) : null,
    created_at: now,
    updated_at: now,
  })));
}

function addressRows() {
  const now = new Date();
  return users().flatMap((user) => (user.addresses || []).map((address) => ({
    id: address.id,
    user_id: user.id,
    label: address.label,
    line1: address.line1,
    district: address.district,
    city: address.city,
    is_default: Boolean(address.isDefault),
    lat: address.lat,
    lng: address.lng,
    created_at: now,
    updated_at: now,
  })));
}

function orderRows() {
  return orders().map((order) => ({
    id: order.id,
    customer_id: order.customerId,
    restaurant_id: order.restaurantId,
    restaurant_name: order.restaurantName,
    branch_id: order.branchId || null,
    branch_name: order.branchName || null,
    status: order.status,
    estimated_delivery_at: timestamp(order.estimatedDeliveryAt),
    delivery_address: order.deliveryAddress,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    discount: order.discount,
    total: order.total,
    rider_name: order.riderName || null,
    payment_method: order.paymentMethod || null,
    payment_summary: order.paymentSummary || null,
    delivery_instructions: order.deliveryInstructions || null,
    voucher_code: order.voucherCode || null,
    loyalty_points_redeemed: order.loyaltyPointsRedeemed || 0,
    refund_status: order.refundStatus || 'NONE',
    refund_approved_at: order.refundApprovedAt ? timestamp(order.refundApprovedAt) : null,
    refund_reason: order.refundReason || null,
    created_at: timestamp(order.createdAt),
    updated_at: timestamp(order.createdAt),
  }));
}

function orderItemRows() {
  return orders().flatMap((order) => order.items.map((item) => ({
    id: item.id,
    order_id: order.id,
    menu_item_id: item.menuItemId || item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    modifiers: JSON.stringify(item.modifiers || []),
    note: item.note || null,
    created_at: timestamp(order.createdAt),
    updated_at: timestamp(order.createdAt),
  })));
}

function orderTimelineRows() {
  return orders().flatMap((order) => order.timeline.map((entry) => ({
    order_id: order.id,
    status: entry.status,
    label: entry.label,
    time: entry.time,
    created_at: timestamp(order.createdAt),
    updated_at: timestamp(order.createdAt),
  })));
}

function notificationRows() {
  return notifications().map((notification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    kind: notification.kind,
    audience_role: notification.audienceRole,
    user_id: notification.userId || null,
    cta_label: notification.ctaLabel || null,
    cta_to: notification.ctaTo || null,
    created_at: timestamp(notification.createdAt),
    updated_at: timestamp(notification.createdAt),
  }));
}

function notificationReadRows() {
  const now = new Date();
  return notifications().flatMap((notification) => (notification.readBy || []).map((userId) => ({
    notification_id: notification.id,
    user_id: userId,
    created_at: now,
    updated_at: now,
  })));
}

function activityLogRows() {
  return orders().flatMap((order) => order.timeline.map((entry, index) => {
    const createdAt = new Date(new Date(order.createdAt).getTime() + index * 7 * 60 * 1000);
    const isDispatch = ['RIDER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'].includes(entry.status);
    return {
      id: `log-seed-order-${order.id}-${index}`,
      actor_user_id: null,
      actor_name: 'System Seed',
      actor_role: 'system',
      restaurant_id: order.restaurantId,
      restaurant_name: order.restaurantName,
      order_id: order.id,
      domain: isDispatch ? 'dispatch' : 'order',
      action: isDispatch ? 'dispatch.timeline_seeded' : 'order.timeline_seeded',
      title: `${order.id} moved to ${statusLabel(entry.status)}`,
      description: `${order.restaurantName} recorded a historical ${statusLabel(entry.status)} event for ${order.id}.`,
      metadata: JSON.stringify({ status: entry.status, seeded: true }),
      created_at: createdAt,
      updated_at: createdAt,
    };
  }));
}

function analyticsSnapshotRows() {
  const now = new Date();
  return [{ id: 'current', payload: JSON.stringify(analytics()), created_at: now, updated_at: now }];
}

module.exports = {
  addressRows,
  activityLogRows,
  analyticsSnapshotRows,
  branchOperatingHourRows,
  branchRows,
  holidayClosureRows,
  menuCategoryRows,
  menuItemRows,
  notificationReadRows,
  notificationRows,
  orderItemRows,
  orderRows,
  orderTimelineRows,
  permissionRows,
  restaurantRows,
  roleAssignmentRows,
  rolePermissionRows,
  roleRows,
  userRows,
};