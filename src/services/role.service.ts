import type { RoleDefinition, RoleInput, User } from '@/types';
import { createActivityLog } from '@/services/activity-log.service';
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

  const now = new Date().toISOString();
  const role: RoleDefinition = {
    id: `role-${crypto.randomUUID()}`,
    name: normalizedName,
    label: payload.label.trim(),
    description: payload.description.trim(),
    isSystem: false,
    createdAt: now,
    updatedAt: now,
    permissions: [...new Set(payload.permissions)].sort(),
  };

  saveRoles(sortRoleDefinitions([role, ...roles]));
  void createActivityLog({
    domain: 'auth',
    action: 'role.created',
    title: `Role created: ${role.label}`,
    description: `${role.label} was created with ${role.permissions.length} permissions.`,
    metadata: {
      roleName: role.name,
      permissionCount: role.permissions.length,
    },
  });
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

  const now = new Date().toISOString();
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
      updatedAt: now,
    };
  });

  if (existing.name !== normalizedName) {
    const users = dbUsers();
    const nextUsers = users.map((user) => {
      if (user.role !== existing.name && !user.roleAssignments.some((assignment) => assignment.roleName === existing.name || assignment.roleId === existing.id)) {
        return user;
      }

      return {
        ...user,
        role: user.role === existing.name ? normalizedName : user.role,
        roleAssignments: user.roleAssignments.map((assignment) =>
          assignment.roleName === existing.name || assignment.roleId === existing.id
            ? {
                ...assignment,
                roleName: normalizedName,
                roleId: roleId,
              }
            : assignment,
        ),
        updatedAt: now,
      } satisfies User;
    });
    saveUsers(nextUsers);
  } else {
    const users = dbUsers();
    const nextUsers = users.map((user) => ({
      ...user,
      roleAssignments: user.roleAssignments.map((assignment) =>
        assignment.roleName === normalizedName || assignment.roleId === existing.id
          ? {
              ...assignment,
              roleId: roleId,
            }
          : assignment,
      ),
    }));
    saveUsers(nextUsers);
  }

  saveRoles(sortRoleDefinitions(nextRoles));
  const updatedRole = nextRoles.find((role) => role.id === roleId) ?? null;
  if (updatedRole) {
    void createActivityLog({
      domain: 'auth',
      action: 'role.updated',
      title: `Role updated: ${updatedRole.label}`,
      description: `${updatedRole.label} was updated and its permissions were refreshed.`,
      metadata: {
        roleName: updatedRole.name,
        permissionCount: updatedRole.permissions.length,
      },
    });
  }
  return updatedRole;
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

  const usersUsingRole = dbUsers().filter(
    (user) => user.role === role.name || user.roleAssignments.some((assignment) => assignment.roleName === role.name || assignment.roleId === role.id),
  );
  if (usersUsingRole.length) {
    throw new Error('This role is assigned to one or more users. Reassign them before deleting it.');
  }

  saveRoles(sortRoleDefinitions(roles.filter((entry) => entry.id !== roleId)));
  void createActivityLog({
    domain: 'auth',
    action: 'role.deleted',
    title: `Role deleted: ${role.label}`,
    description: `${role.label} was removed from the role catalog.`,
    metadata: {
      roleName: role.name,
    },
  });
  return true;
}
