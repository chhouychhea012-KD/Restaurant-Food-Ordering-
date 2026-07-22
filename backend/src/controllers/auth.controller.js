const crypto = require('crypto');
const { Role, Permission, RoleAssignment, User, Address } = require('../models');
const { ApiError, created, ok } = require('../utils/http');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signAccessToken, signRefreshToken } = require('../utils/token');
const { serializeUser } = require('../services/serializer.service');

function initials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

async function userWithRelations(id) {
  return User.findByPk(id, {
    include: [
      { model: Address, as: 'addresses' },
      { model: RoleAssignment, as: 'roleAssignments' },
    ],
  });
}

async function sessionFor(user) {
  const role = await Role.findOne({
    where: { name: user.role },
    include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
  });
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  return {
    accessToken,
    refreshToken,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    userId: user.id,
    permissions: role?.permissions?.map((permission) => permission.key) || [],
  };
}

async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email: String(email || '').toLowerCase() } });
  if (!user || !(await verifyPassword(password || '', user.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password.');
  }
  if (user.status !== 'active') {
    throw new ApiError(403, `This account is ${user.status} and cannot sign in right now.`);
  }

  const fullUser = await userWithRelations(user.id);
  return ok(res, { user: serializeUser(fullUser), session: await sessionFor(user) });
}

async function register(req, res) {
  const { name, email, phone, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const existing = await User.findOne({ where: { email: normalizedEmail } });
  if (existing) {
    throw new ApiError(409, 'This email is already registered.');
  }

  const customerRole = await Role.findOne({ where: { name: 'customer' } });
  const id = `user-${crypto.randomUUID()}`;
  await User.create({
    id,
    name,
    email: normalizedEmail,
    phone,
    passwordHash: await hashPassword(password),
    role: 'customer',
    status: 'active',
    avatar: initials(name),
    avatarUrl: null,
    restaurantId: null,
    shiftActive: true,
    loyaltyPoints: 120,
  });
  await RoleAssignment.create({
    id: `assignment-${id}`,
    userId: id,
    roleId: customerRole?.id || null,
    roleName: 'customer',
    restaurantIds: [],
    branchIds: [],
    accessWindow: null,
  });
  await Address.create({
    id: `addr-${crypto.randomUUID()}`,
    userId: id,
    label: 'Primary',
    line1: 'Set your delivery address',
    district: 'Bangkok Central',
    city: 'Bangkok',
    isDefault: true,
    lat: 13.7563,
    lng: 100.5018,
  });

  const user = await userWithRelations(id);
  return created(res, { user: serializeUser(user), session: await sessionFor(user) });
}

async function me(req, res) {
  const user = await userWithRelations(req.user.id);
  const session = await sessionFor(req.user);
  return ok(res, { ...serializeUser(user), permissions: session.permissions });
}

module.exports = {
  login,
  me,
  register,
};
