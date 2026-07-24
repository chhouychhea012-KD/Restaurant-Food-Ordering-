const crypto = require('crypto');
const { Branch, BranchOperatingHour, HolidayClosure, MenuCategory, MenuItem, Restaurant } = require('../models');
const { ApiError, created, noContent, ok } = require('../utils/http');
const { serializeRestaurant } = require('../services/serializer.service');
const { slugify } = require('../utils/slug');
const workflow = require('../services/workflow.service');

const includeRestaurant = [
  { model: Branch, as: 'branches', include: [{ model: BranchOperatingHour, as: 'operatingHours' }, { model: HolidayClosure, as: 'holidayClosures' }] },
  { model: MenuCategory, as: 'menuCategories', include: [{ model: MenuItem, as: 'items' }] },
];

function defaultBranch() {
  return {
    id: `branch-${crypto.randomUUID()}`,
    name: 'Main Branch',
    zone: 'Phnom Penh - BKK1',
    lat: 11.5526,
    lng: 104.9282,
    phone: '+855 12 000 000',
    status: 'open',
    averagePrepMinutes: 18,
    minimumOrderAmount: 10,
    operatingHours: [
      { day: 0, label: 'Sun', open: '10:00', close: '21:00', closed: false },
      { day: 1, label: 'Mon', open: '10:00', close: '21:00', closed: false },
      { day: 2, label: 'Tue', open: '10:00', close: '21:00', closed: false },
      { day: 3, label: 'Wed', open: '10:00', close: '21:00', closed: false },
      { day: 4, label: 'Thu', open: '10:00', close: '21:00', closed: false },
      { day: 5, label: 'Fri', open: '10:00', close: '22:00', closed: false },
      { day: 6, label: 'Sat', open: '10:00', close: '22:00', closed: false },
    ],
    holidayClosures: [],
  };
}

async function replaceBranches(restaurantId, branches) {
  await Branch.destroy({ where: { restaurantId } });
  for (const branchInput of branches.length ? branches : [defaultBranch()]) {
    const branch = await Branch.create({
      id: branchInput.id || `branch-${crypto.randomUUID()}`,
      restaurantId,
      name: branchInput.name,
      zone: branchInput.zone,
      lat: branchInput.lat,
      lng: branchInput.lng,
      phone: branchInput.phone,
      status: branchInput.status || 'open',
      averagePrepMinutes: branchInput.averagePrepMinutes || 18,
      minimumOrderAmount: branchInput.minimumOrderAmount || 150,
    });
    await BranchOperatingHour.bulkCreate((branchInput.operatingHours || defaultBranch().operatingHours).map((hour) => ({ ...hour, branchId: branch.id })));
    await HolidayClosure.bulkCreate((branchInput.holidayClosures || []).map((closure) => ({ ...closure, id: closure.id || `holiday-${crypto.randomUUID()}`, branchId: branch.id })));
  }
}

async function list(req, res) {
  const { q, category } = req.query;
  const restaurants = await Restaurant.findAll({ include: includeRestaurant, order: [['createdAt', 'DESC']] });
  const term = String(q || '').toLowerCase();
  const categoryTerm = String(category || '').toLowerCase();
  const filtered = restaurants.filter((restaurant) => {
    const value = serializeRestaurant(restaurant);
    if (value.partnerStatus === 'suspended') {
      return false;
    }
    const matchesQuery =
      !term ||
      value.name.toLowerCase().includes(term) ||
      value.cuisine.some((item) => item.toLowerCase().includes(term)) ||
      value.menuCategories.some((menuCategory) => menuCategory.name.toLowerCase().includes(term) || menuCategory.items.some((item) => item.name.toLowerCase().includes(term)));
    const matchesCategory = !categoryTerm || value.menuCategories.some((menuCategory) => menuCategory.name.toLowerCase() === categoryTerm);
    return matchesQuery && matchesCategory;
  });
  return ok(res, filtered.map(serializeRestaurant));
}

async function show(req, res) {
  const where = req.params.idOrSlug.includes('rest-') ? { id: req.params.idOrSlug } : { slug: req.params.idOrSlug };
  const restaurant = await Restaurant.findOne({ where, include: includeRestaurant });
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found.');
  }
  return ok(res, serializeRestaurant(restaurant));
}

async function create(req, res) {
  const id = `rest-${crypto.randomUUID()}`;
  const restaurant = await Restaurant.create({
    id,
    name: req.body.name,
    slug: slugify(req.body.name),
    cuisine: req.body.cuisine || [],
    description: req.body.description || '',
    rating: req.body.rating || 4.5,
    reviewCount: req.body.reviewCount || 0,
    deliveryTime: req.body.deliveryTime,
    deliveryFee: req.body.deliveryFee,
    heroColor: req.body.heroColor || 'from-orange-500 to-amber-400',
    coverImage: req.body.coverImage,
    status: req.body.status || 'open',
    verified: Boolean(req.body.verified),
    partnerStatus: req.body.partnerStatus || 'pending',
    suspensionReason: req.body.suspensionReason || null,
    commissionRate: req.body.commissionRate || 0.18,
  });
  await replaceBranches(id, req.body.branches || []);
  await workflow.createActivity(req, {
    domain: 'restaurant',
    action: 'restaurant.created',
    title: 'Created restaurant ' + restaurant.name,
    description: restaurant.name + ' was added to the restaurant roster.',
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    metadata: { status: restaurant.status, verified: Boolean(restaurant.verified), partnerStatus: restaurant.partnerStatus },
  });
  const fullRestaurant = await Restaurant.findByPk(restaurant.id, { include: includeRestaurant });
  return created(res, serializeRestaurant(fullRestaurant));
}

async function update(req, res) {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found.');
  }
  await restaurant.update({
    name: req.body.name,
    slug: slugify(req.body.name),
    cuisine: req.body.cuisine || [],
    description: req.body.description || '',
    deliveryTime: req.body.deliveryTime,
    deliveryFee: req.body.deliveryFee,
    heroColor: req.body.heroColor,
    coverImage: req.body.coverImage,
    status: req.body.status,
    verified: Boolean(req.body.verified),
    partnerStatus: req.body.partnerStatus,
    suspensionReason: req.body.suspensionReason || null,
    commissionRate: req.body.commissionRate,
    reviewCount: req.body.reviewCount,
  });
  if (req.body.branches) {
    await replaceBranches(restaurant.id, req.body.branches);
  }
  await workflow.createActivity(req, {
    domain: 'restaurant',
    action: 'restaurant.updated',
    title: 'Updated restaurant ' + restaurant.name,
    description: restaurant.name + ' had its operational profile updated.',
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    metadata: { status: restaurant.status, verified: Boolean(restaurant.verified), partnerStatus: restaurant.partnerStatus },
  });
  const fullRestaurant = await Restaurant.findByPk(restaurant.id, { include: includeRestaurant });
  return ok(res, serializeRestaurant(fullRestaurant));
}

async function remove(req, res) {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found.');
  }
  await workflow.createActivity(req, {
    domain: 'restaurant',
    action: 'restaurant.deleted',
    title: 'Deleted restaurant ' + restaurant.name,
    description: restaurant.name + ' was removed from the restaurant roster.',
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    metadata: { status: restaurant.status, partnerStatus: restaurant.partnerStatus },
  });
  await restaurant.destroy();
  return noContent(res);
}

async function setVerification(req, res) {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found.');
  }
  await restaurant.update({ verified: Boolean(req.body.verified), partnerStatus: req.body.verified ? 'verified' : 'pending' });
  await workflow.createActivity(req, {
    domain: 'restaurant',
    action: 'restaurant.verification_changed',
    title: (restaurant.verified ? 'Verified ' : 'Unverified ') + restaurant.name,
    description: restaurant.name + ' verification was updated.',
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    metadata: { verified: Boolean(restaurant.verified), partnerStatus: restaurant.partnerStatus },
  });
  const fullRestaurant = await Restaurant.findByPk(restaurant.id, { include: includeRestaurant });
  return ok(res, serializeRestaurant(fullRestaurant));
}

async function setPartnerStatus(req, res) {
  const restaurant = await Restaurant.findByPk(req.params.id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found.');
  }
  await restaurant.update({
    partnerStatus: req.body.partnerStatus,
    verified: req.body.partnerStatus === 'verified',
    suspensionReason: req.body.partnerStatus === 'suspended' ? req.body.suspensionReason || 'Suspended by admin' : null,
  });
  await workflow.createActivity(req, {
    domain: 'restaurant',
    action: 'restaurant.partner_status_changed',
    title: restaurant.name + ' moved to ' + restaurant.partnerStatus,
    description: restaurant.name + ' partner status was updated to ' + restaurant.partnerStatus + '.',
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    metadata: { partnerStatus: restaurant.partnerStatus, suspensionReason: restaurant.suspensionReason || null },
  });
  const fullRestaurant = await Restaurant.findByPk(restaurant.id, { include: includeRestaurant });
  return ok(res, serializeRestaurant(fullRestaurant));
}

module.exports = {
  create,
  list,
  remove,
  setPartnerStatus,
  setVerification,
  show,
  update,
};
