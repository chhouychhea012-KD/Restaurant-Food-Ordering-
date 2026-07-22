const crypto = require('crypto');
const { Address, Role, RoleAssignment, User } = require('../models');
const { ApiError, created, noContent, ok } = require('../utils/http');
const { hashPassword } = require('../utils/password');
const { serializeUser } = require('../services/serializer.service');
const workflow = require('../services/workflow.service');

const includeUser = [
  { model: Address, as: 'addresses' },
  { model: RoleAssignment, as: 'roleAssignments' },
];

function initials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

async function list(req, res) {
  const users = await User.findAll({ include: includeUser, order: [['createdAt', 'DESC']] });
  return ok(res, users.map(serializeUser));
}

async function show(req, res) {
  const user = await User.findByPk(req.params.id, { include: includeUser });
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  return ok(res, serializeUser(user));
}

async function create(req, res) {
  const existing = await User.findOne({ where: { email: String(req.body.email).toLowerCase() } });
  if (existing) {
    throw new ApiError(409, 'A user with this email already exists.');
  }
  const id = `user-${crypto.randomUUID()}`;
  const role = await Role.findOne({ where: { name: req.body.role } });
  await User.create({
    id,
    name: req.body.name,
    email: String(req.body.email).toLowerCase(),
    phone: req.body.phone,
    passwordHash: await hashPassword(req.body.password || 'Welcome@123'),
    role: req.body.role,
    status: req.body.status || 'active',
    avatar: initials(req.body.name),
    avatarUrl: req.body.avatarUrl || null,
    restaurantId: req.body.restaurantId || null,
    shiftActive: req.body.shiftActive !== false,
    loyaltyPoints: req.body.role === 'customer' ? 0 : null,
  });
  await RoleAssignment.create({
    id: `assignment-${id}`,
    userId: id,
    roleId: role?.id || null,
    roleName: req.body.role,
    restaurantIds: req.body.restaurantId ? [req.body.restaurantId] : [],
    branchIds: [],
    accessWindow: req.body.accessWindow || null,
  });
  await workflow.createActivity(req, { domain: 'auth', action: 'user.created', title: 'User created: ' + req.body.name, description: req.body.name + ' was added with the ' + req.body.role + ' role.', restaurantId: req.body.restaurantId || null, metadata: { roleName: req.body.role, status: req.body.status || 'active' } });
  const user = await User.findByPk(id, { include: includeUser });
  return created(res, serializeUser(user));
}

async function update(req, res) {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  const role = await Role.findOne({ where: { name: req.body.role } });
  await user.update({
    name: req.body.name,
    email: String(req.body.email).toLowerCase(),
    phone: req.body.phone,
    role: req.body.role,
    status: req.body.status,
    avatar: initials(req.body.name),
    avatarUrl: req.body.avatarUrl === undefined ? user.avatarUrl : req.body.avatarUrl,
    restaurantId: req.body.restaurantId || null,
    shiftActive: req.body.shiftActive !== false,
    loyaltyPoints: req.body.role === 'customer' ? user.loyaltyPoints || 0 : null,
  });
  await RoleAssignment.destroy({ where: { userId: user.id } });
  await RoleAssignment.create({
    id: `assignment-${user.id}`,
    userId: user.id,
    roleId: role?.id || null,
    roleName: req.body.role,
    restaurantIds: req.body.restaurantId ? [req.body.restaurantId] : [],
    branchIds: [],
    accessWindow: req.body.accessWindow || null,
  });
  await workflow.createActivity(req, { domain: 'auth', action: 'user.updated', title: 'User updated: ' + user.name, description: user.name + ' role, account state, or contact information was updated.', restaurantId: user.restaurantId || null, metadata: { roleName: user.role, status: user.status } });
  const updated = await User.findByPk(user.id, { include: includeUser });
  return ok(res, serializeUser(updated));
}

async function remove(req, res) {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  await workflow.createActivity(req, { domain: 'auth', action: 'user.deleted', title: 'User deleted: ' + user.name, description: user.name + ' was removed from the user directory.', restaurantId: user.restaurantId || null, metadata: { roleName: user.role, status: user.status } });
  await user.destroy();
  return noContent(res);
}

module.exports = {
  create,
  list,
  remove,
  show,
  update,
};
