import type { CoreRole, PermissionKey, RoleDefinition } from '@/types';
import { dbRoles } from './mockDb';

export const coreRoles: CoreRole[] = ['admin', 'owner', 'kitchen', 'rider', 'customer'];

export const permissionCatalog: PermissionKey[] = [
  'roles.read',
  'roles.create',
  'roles.update',
  'roles.delete',
  'permissions.assign',
  'permissions.revoke',
  'activity_logs.read',
  'activity_logs.export',
  'restaurants.read',
  'restaurants.create',
  'restaurants.update',
  'restaurants.suspend',
  'restaurants.delete',
  'branches.manage',
  'menus.read',
  'menus.manage',
  'menus.availability.update',
  'orders.read',
  'orders.create',
  'orders.accept',
  'orders.reject',
  'orders.status.update',
  'orders.cancel',
  'orders.refund.approve',
  'dispatch.read',
  'dispatch.assign',
  'riders.read',
  'riders.manage',
  'riders.status.update',
  'zones.read',
  'zones.manage',
  'fees.manage',
  'surge.manage',
  'customers.read',
  'customers.manage',
  'customers.blacklist',
  'promotions.read',
  'promotions.manage',
  'loyalty.manage',
  'analytics.read',
  'reports.export',
  'profile.manage',
  'users.manage',
];

export function getRoleDefinition(role: string) {
  return dbRoles().find((entry) => entry.name === role);
}

export function hasPermission(role: string, permission: PermissionKey) {
  const definition = getRoleDefinition(role);
  return Boolean(definition?.permissions.includes(permission));
}

export function isCoreRole(roleName: string) {
  return coreRoles.includes(roleName as CoreRole);
}

export function sortRoleDefinitions(roles: RoleDefinition[]) {
  return [...roles].sort((left, right) => left.label.localeCompare(right.label));
}
