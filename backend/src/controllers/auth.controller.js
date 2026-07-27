const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const { Role, Permission, RoleAssignment, User, Address } = require('../models');
const { ApiError, created, ok } = require('../utils/http');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signAccessToken, signRefreshToken } = require('../utils/token');
const { serializeUser } = require('../services/serializer.service');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const GOOGLE_AUTH_PASSWORD_PREFIX = 'google-oauth:';

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

async function createCustomerUser({ name, email, phone = '', avatarUrl = null, password }) {
  const customerRole = await Role.findOne({ where: { name: 'customer' } });
  const id = `user-${crypto.randomUUID()}`;
  await User.create({
    id,
    name,
    email,
    phone,
    passwordHash: await hashPassword(password),
    role: 'customer',
    status: 'active',
    avatar: initials(name),
    avatarUrl,
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
    label: 'Home',
    line1: 'Street 310, BKK1',
    district: 'Boeung Keng Kang',
    city: 'Phnom Penh',
    isDefault: true,
    lat: 11.5526,
    lng: 104.9282,
  });

  return userWithRelations(id);
}

async function register(req, res) {
  const { name, email, phone, password } = req.body;
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const existing = await User.findOne({ where: { email: normalizedEmail } });
  if (existing) {
    throw new ApiError(409, 'This email is already registered.');
  }

  const user = await createCustomerUser({
    name,
    email: normalizedEmail,
    phone: phone || '',
    password,
  });

  return created(res, { user: serializeUser(user), session: await sessionFor(user) });
}

async function google(req, res) {
  const { credential } = req.body;
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(500, 'Google login is not configured on the server.');
  }
  if (!credential) {
    throw new ApiError(400, 'Google credential is required.');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const email = String(payload?.email || '').trim().toLowerCase();
  if (!email || !payload?.email_verified) {
    throw new ApiError(401, 'Google account email is not verified.');
  }

  let user = await User.findOne({ where: { email } });
  if (!user) {
    user = await createCustomerUser({
      name: payload.name || email.split('@')[0],
      email,
      avatarUrl: payload.picture || null,
      password: GOOGLE_AUTH_PASSWORD_PREFIX + crypto.randomUUID(),
    });
  } else if (user.role !== 'customer') {
    throw new ApiError(403, 'Google login is only available for customer accounts. Please use email and password for staff access.');
  }

  if (user.status !== 'active') {
    throw new ApiError(403, `This account is ${user.status} and cannot sign in right now.`);
  }

  const fullUser = await userWithRelations(user.id);
  return ok(res, { user: serializeUser(fullUser), session: await sessionFor(user) });
}

async function me(req, res) {
  const user = await userWithRelations(req.user.id);
  const session = await sessionFor(req.user);
  return ok(res, { ...serializeUser(user), permissions: session.permissions });
}

module.exports = {
  google,
  login,
  me,
  register,
};
