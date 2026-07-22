function plain(model) {
  if (!model) {
    return null;
  }
  return typeof model.get === 'function' ? model.get({ plain: true }) : model;
}

function parseJson(value, fallback) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
}

function asArray(value) {
  const parsed = parseJson(value, []);
  return Array.isArray(parsed) ? parsed : [];
}

function asObject(value) {
  const parsed = parseJson(value, null);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
}

function camelizeBase(row) {
  const value = plain(row);
  if (!value) {
    return null;
  }
  return value;
}

function serializeRoleAssignment(assignment) {
  const value = plain(assignment);
  return {
    ...value,
    restaurantIds: asArray(value.restaurantIds),
    branchIds: asArray(value.branchIds),
    accessWindow: asObject(value.accessWindow),
  };
}

function serializeAddress(address) {
  const value = plain(address);
  return {
    ...value,
    isDefault: Boolean(value.isDefault),
    lat: Number(value.lat),
    lng: Number(value.lng),
  };
}

function serializeBranch(branch) {
  const value = plain(branch);
  return {
    ...value,
    lat: Number(value.lat),
    lng: Number(value.lng),
    averagePrepMinutes: Number(value.averagePrepMinutes),
    minimumOrderAmount: Number(value.minimumOrderAmount),
    operatingHours: (value.operatingHours || []).map((hour) => ({ ...plain(hour), closed: Boolean(plain(hour).closed) })),
    holidayClosures: (value.holidayClosures || []).map(plain),
  };
}

function serializeMenuItem(item) {
  const value = plain(item);
  return {
    ...value,
    price: Number(value.price),
    available: Boolean(value.available),
    prepTime: Number(value.prepTime),
    modifiers: asArray(value.modifiers),
  };
}

function serializeMenuCategory(category) {
  const value = plain(category);
  return {
    ...value,
    items: (value.items || []).map(serializeMenuItem),
  };
}

function serializeRole(role) {
  const value = plain(role);
  return {
    id: value.id,
    name: value.name,
    label: value.label,
    description: value.description,
    isSystem: Boolean(value.isSystem),
    permissions: (value.permissions || []).map((permission) => permission.key).sort(),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function serializeUser(user) {
  const value = plain(user);
  return {
    id: value.id,
    name: value.name,
    email: value.email,
    passwordHash: value.passwordHash,
    role: value.role,
    status: value.status,
    phone: value.phone,
    avatar: value.avatar,
    avatarUrl: value.avatarUrl,
    restaurantId: value.restaurantId,
    shiftActive: Boolean(value.shiftActive),
    roleAssignments: (value.roleAssignments || []).map(serializeRoleAssignment),
    loyaltyPoints: value.loyaltyPoints,
    addresses: (value.addresses || []).map(serializeAddress),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function serializeRestaurant(restaurant) {
  const value = plain(restaurant);
  return {
    id: value.id,
    name: value.name,
    slug: value.slug,
    cuisine: asArray(value.cuisine),
    description: value.description,
    rating: Number(value.rating),
    reviewCount: Number(value.reviewCount),
    deliveryTime: value.deliveryTime,
    deliveryFee: Number(value.deliveryFee),
    heroColor: value.heroColor,
    coverImage: value.coverImage,
    status: value.status,
    verified: Boolean(value.verified),
    partnerStatus: value.partnerStatus,
    suspensionReason: value.suspensionReason,
    commissionRate: Number(value.commissionRate),
    branches: (value.branches || []).map(serializeBranch),
    menuCategories: (value.menuCategories || []).map(serializeMenuCategory),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function serializeOrderItem(item) {
  const value = plain(item);
  return {
    ...value,
    quantity: Number(value.quantity),
    price: Number(value.price),
    modifiers: asArray(value.modifiers),
  };
}

function serializeOrder(order) {
  const value = plain(order);
  return {
    id: value.id,
    customerId: value.customerId,
    restaurantId: value.restaurantId,
    restaurantName: value.restaurantName,
    branchId: value.branchId,
    branchName: value.branchName,
    status: value.status,
    createdAt: value.createdAt,
    estimatedDeliveryAt: value.estimatedDeliveryAt,
    deliveryAddress: value.deliveryAddress,
    items: (value.items || []).map(serializeOrderItem),
    timeline: (value.timeline || []).map(plain),
    subtotal: Number(value.subtotal),
    deliveryFee: Number(value.deliveryFee),
    discount: Number(value.discount),
    total: Number(value.total),
    riderName: value.riderName,
    paymentMethod: value.paymentMethod,
    paymentSummary: value.paymentSummary,
    deliveryInstructions: value.deliveryInstructions,
    voucherCode: value.voucherCode,
    loyaltyPointsRedeemed: value.loyaltyPointsRedeemed,
    refundStatus: value.refundStatus,
    refundApprovedAt: value.refundApprovedAt,
    refundReason: value.refundReason,
  };
}

function serializeNotification(notification) {
  const value = plain(notification);
  return {
    id: value.id,
    title: value.title,
    message: value.message,
    kind: value.kind,
    audienceRole: value.audienceRole,
    userId: value.userId,
    ctaLabel: value.ctaLabel,
    ctaTo: value.ctaTo,
    createdAt: value.createdAt,
    readBy: (value.reads || []).map((read) => read.userId),
  };
}

function serializeActivityLog(entry) {
  const value = plain(entry);
  return {
    id: value.id,
    createdAt: value.createdAt,
    actorUserId: value.actorUserId,
    actorName: value.actorName,
    actorRole: value.actorRole,
    restaurantId: value.restaurantId,
    restaurantName: value.restaurantName,
    orderId: value.orderId,
    domain: value.domain,
    action: value.action,
    title: value.title,
    description: value.description,
    metadata: parseJson(value.metadata, value.metadata),
  };
}

module.exports = {
  camelizeBase,
  serializeActivityLog,
  serializeMenuCategory,
  serializeMenuItem,
  serializeNotification,
  serializeOrder,
  serializeRestaurant,
  serializeRole,
  serializeUser,
};