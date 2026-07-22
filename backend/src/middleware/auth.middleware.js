const { Role, Permission, User } = require('../models');
const { ApiError } = require('../utils/http');
const { verifyAccessToken } = require('../utils/token');

async function loadUserPermissions(user) {
  const role = await Role.findOne({
    where: { name: user.role },
    include: [{ model: Permission, as: 'permissions', through: { attributes: [] } }],
  });
  return role?.permissions?.map((permission) => permission.key) || [];
}

async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      throw new ApiError(401, 'Authentication token is required.');
    }

    const payload = verifyAccessToken(token);
    const user = await User.findByPk(payload.sub);
    if (!user || user.status !== 'active') {
      throw new ApiError(401, 'User session is no longer valid.');
    }

    req.user = user;
    req.permissions = await loadUserPermissions(user);
    next();
  } catch (error) {
    next(error.status ? error : new ApiError(401, 'Invalid or expired token.'));
  }
}

function authorize(requiredPermissions = []) {
  return (req, _res, next) => {
    const missing = requiredPermissions.filter((permission) => !req.permissions?.includes(permission));
    if (missing.length) {
      next(new ApiError(403, `Missing permission: ${missing.join(', ')}`));
      return;
    }
    next();
  };
}

function authorizeAny(allowedPermissions = []) {
  return (req, _res, next) => {
    if (allowedPermissions.some((permission) => req.permissions?.includes(permission))) {
      next();
      return;
    }
    next(new ApiError(403, `Missing one of permissions: ${allowedPermissions.join(', ')}`));
  };
}

module.exports = {
  authenticate,
  authorize,
  authorizeAny,
  loadUserPermissions,
};
