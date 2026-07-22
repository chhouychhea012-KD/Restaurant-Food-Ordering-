const crypto = require('crypto');
const { Permission, Role, RolePermission } = require('../models');
const { coreRoles, permissionCatalog } = require('../config/permissions');
const { ApiError, created, noContent, ok } = require('../utils/http');
const { serializeRole } = require('../services/serializer.service');
const { slugify } = require('../utils/slug');
const workflow = require('../services/workflow.service');

const includePermissions = [{ model: Permission, as: 'permissions', through: { attributes: [] } }];

async function list(req, res) {
  const roles = await Role.findAll({ include: includePermissions, order: [['label', 'ASC']] });
  return ok(res, roles.map(serializeRole));
}

async function permissions(_req, res) {
  return ok(res, permissionCatalog);
}

async function create(req, res) {
  const roleName = slugify(req.body.name).replace(/-/g, '_');
  if (!roleName) {
    throw new ApiError(422, 'Role key is required.');
  }
  const existing = await Role.findOne({ where: { name: roleName } });
  if (existing) {
    throw new ApiError(409, 'A role with this key already exists.');
  }

  const role = await Role.create({
    id: `role-${crypto.randomUUID()}`,
    name: roleName,
    label: req.body.label,
    description: req.body.description || '',
    isSystem: false,
  });
  await RolePermission.bulkCreate((req.body.permissions || []).map((permissionKey) => ({ roleId: role.id, permissionKey })));
  await workflow.createActivity(req, { domain: 'auth', action: 'role.created', title: 'Role created: ' + role.label, description: role.label + ' was created with ' + (req.body.permissions || []).length + ' permissions.', metadata: { roleName: role.name, permissionCount: (req.body.permissions || []).length } });
  const fullRole = await Role.findByPk(role.id, { include: includePermissions });
  return created(res, serializeRole(fullRole));
}

async function update(req, res) {
  const role = await Role.findByPk(req.params.id);
  if (!role) {
    throw new ApiError(404, 'Role not found.');
  }
  const nextName = coreRoles.includes(role.name) ? role.name : slugify(req.body.name).replace(/-/g, '_');
  await role.update({
    name: nextName,
    label: req.body.label,
    description: req.body.description || '',
  });
  await RolePermission.destroy({ where: { roleId: role.id } });
  await RolePermission.bulkCreate((req.body.permissions || []).map((permissionKey) => ({ roleId: role.id, permissionKey })));
  await workflow.createActivity(req, { domain: 'auth', action: 'role.updated', title: 'Role updated: ' + role.label, description: role.label + ' permissions were refreshed.', metadata: { roleName: role.name, permissionCount: (req.body.permissions || []).length } });
  const fullRole = await Role.findByPk(role.id, { include: includePermissions });
  return ok(res, serializeRole(fullRole));
}

async function remove(req, res) {
  const role = await Role.findByPk(req.params.id);
  if (!role) {
    throw new ApiError(404, 'Role not found.');
  }
  if (coreRoles.includes(role.name)) {
    throw new ApiError(422, 'Core system roles cannot be deleted.');
  }
  await workflow.createActivity(req, { domain: 'auth', action: 'role.deleted', title: 'Role deleted: ' + role.label, description: role.label + ' was removed from the role catalog.', metadata: { roleName: role.name } });
  await role.destroy();
  return noContent(res);
}

module.exports = {
  create,
  list,
  permissions,
  remove,
  update,
};
