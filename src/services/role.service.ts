import type { RoleDefinition, RoleInput, User } from '@/types';
import { dbRoles, dbUsers, saveRoles, saveUsers } from '@/utils/mockDb';
import { coreRoles, isCoreRole, permissionCatalog, sortRoleDefinitions } from '@/utils/permissions';
import { slugify } from '@/utils/slug';

export function listRoles() {
  return sortRoleDefinitions(dbRoles());
}

export function listRolePermissions() {
  return [...permissionCatalog];
}

export function listAssignableSystemRoles() {
  return [...coreRoles];
}

function normalizeRoleName(value: string) {
  return slugify(value).replace(/-/g, '_');
}

export function createRole(payload: RoleInput) {
  const roles = dbRoles();
  const normalizedName = normalizeRoleName(payload.name);
  if (!normalizedName) {
    throw new Error('Role key is required.');
  }
  if (roles.some((role) => role.name === normalizedName)) {
    throw new Error('A role with this key already exists.');
  }

  const role: RoleDefinition = {
    id: `role-${crypto.randomUUID()}`,
    name: normalizedName,
    label: payload.label.trim(),
    description: payload.description.trim(),
    permissions: [...new Set(payload.permissions)].sort(),
  };

  saveRoles(sortRoleDefinitions([role, ...roles]));
  return role;
}

export function updateRole(roleId: string, payload: RoleInput) {
  const roles = dbRoles();
  const existing = roles.find((role) => role.id === roleId);
  if (!existing) {
    throw new Error('Role not found.');
  }

  const normalizedName = isCoreRole(existing.name) ? existing.name : normalizeRoleName(payload.name);
  if (!normalizedName) {
    throw new Error('Role key is required.');
  }
  if (roles.some((role) => role.id !== roleId && role.name === normalizedName)) {
    throw new Error('A role with this key already exists.');
  }

  const nextRoles = roles.map((role) => {
    if (role.id !== roleId) {
      return role;
    }

    return {
      ...role,
      name: normalizedName,
      label: payload.label.trim(),
      description: payload.description.trim(),
      permissions: [...new Set(payload.permissions)].sort(),
    };
  });

  if (existing.name !== normalizedName) {
    const users = dbUsers();
    const nextUsers = users.map((user) =>
      user.role === existing.name
        ? ({
            ...user,
            role: normalizedName,
          } as User)
        : user,
    );
    saveUsers(nextUsers);
  }

  saveRoles(sortRoleDefinitions(nextRoles));
  return nextRoles.find((role) => role.id === roleId) ?? null;
}

export function deleteRole(roleId: string) {
  const roles = dbRoles();
  const role = roles.find((entry) => entry.id === roleId);
  if (!role) {
    throw new Error('Role not found.');
  }
  if (isCoreRole(role.name)) {
    throw new Error('Core system roles cannot be deleted from this frontend.');
  }

  const usersUsingRole = dbUsers().filter((user) => user.role === role.name);
  if (usersUsingRole.length) {
    throw new Error('This role is assigned to one or more users. Reassign them before deleting it.');
  }

  saveRoles(sortRoleDefinitions(roles.filter((entry) => entry.id !== roleId)));
  return true;
}
