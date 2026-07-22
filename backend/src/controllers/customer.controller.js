const crypto = require('crypto');
const { Address, User } = require('../models');
const { ApiError, created, noContent, ok } = require('../utils/http');
const { serializeUser } = require('../services/serializer.service');
const workflow = require('../services/workflow.service');

async function updateProfile(req, res) {
  const user = await User.findByPk(req.params.userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  await user.update({
    name: req.body.name,
    email: String(req.body.email).toLowerCase(),
    phone: req.body.phone,
    avatarUrl: req.body.avatarUrl === undefined ? user.avatarUrl : req.body.avatarUrl,
  });
  await workflow.createActivity(req, { domain: 'auth', action: 'customer.profile_updated', title: 'Customer profile updated: ' + user.name, description: user.name + ' updated profile details.', actorUserId: user.id, actorName: user.name, actorRole: user.role });
  return ok(res, serializeUser(user));
}

async function listAddresses(req, res) {
  const addresses = await Address.findAll({ where: { userId: req.params.userId }, order: [['isDefault', 'DESC'], ['createdAt', 'DESC']] });
  return ok(res, addresses);
}

async function addAddress(req, res) {
  if (req.body.isDefault) {
    await Address.update({ isDefault: false }, { where: { userId: req.params.userId } });
  }
  const address = await Address.create({ ...req.body, id: `addr-${crypto.randomUUID()}`, userId: req.params.userId });
  return created(res, address);
}

async function updateAddress(req, res) {
  const address = await Address.findOne({ where: { id: req.params.addressId, userId: req.params.userId } });
  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }
  if (req.body.isDefault) {
    await Address.update({ isDefault: false }, { where: { userId: req.params.userId } });
  }
  await address.update(req.body);
  await workflow.createActivity(req, { domain: 'access', action: 'customer.address_updated', title: 'Delivery address updated', description: 'A customer delivery address was updated.', actorUserId: req.params.userId, metadata: { addressId: address.id, label: address.label } });
  return ok(res, address);
}

async function deleteAddress(req, res) {
  const address = await Address.findOne({ where: { id: req.params.addressId, userId: req.params.userId } });
  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }
  await workflow.createActivity(req, { domain: 'access', action: 'customer.address_deleted', title: 'Delivery address deleted', description: 'A customer delivery address was deleted.', actorUserId: req.params.userId, metadata: { addressId: address.id, label: address.label } });
  await address.destroy();
  return noContent(res);
}

async function applyLoyalty(req, res) {
  const user = await User.findByPk(req.params.userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  const earnedPoints = Number(req.body.earnedPoints || 0);
  const redeemedPoints = Number(req.body.redeemedPoints || 0);
  await user.update({ loyaltyPoints: Math.max(0, Number(user.loyaltyPoints || 0) - redeemedPoints + earnedPoints) });
  await workflow.createActivity(req, {
    domain: 'auth',
    action: 'customer.loyalty_updated',
    title: 'Customer loyalty updated: ' + user.name,
    description: user.name + ' loyalty balance was updated after checkout.',
    actorUserId: user.id,
    actorName: user.name,
    actorRole: user.role,
    metadata: { earnedPoints, redeemedPoints, loyaltyPoints: Number(user.loyaltyPoints || 0) },
  });
  return ok(res, serializeUser(user));
}
async function deleteAccount(req, res) {
  const user = await User.findByPk(req.params.userId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  await workflow.createActivity(req, { domain: 'auth', action: 'customer.account_deleted', title: 'Customer account deleted: ' + user.name, description: user.name + ' deleted the customer account.', actorUserId: user.id, actorName: user.name, actorRole: user.role });
  await user.destroy();
  return noContent(res);
}

module.exports = {
  addAddress,
  applyLoyalty,
  deleteAccount,
  deleteAddress,
  listAddresses,
  updateAddress,
  updateProfile,
};
