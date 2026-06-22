import type { CoreRole, RoleDefinition } from '@/types';
import { dbRoles } from './mockDb';

export const coreRoles: CoreRole[] = ['admin', 'owner', 'kitchen', 'rider', 'customer'];

export const permissionCatalog = [
  'dashboard.view',
  'roles.manage',
  'restaurants.manage',
  'orders.manage',
  'analytics.view',
  'users.manage',
  'riders.manage',
  'zones.manage',
  'restaurant.manage',
  'menu.manage',
  'orders.view',
  'staff.manage',
  'analytics.restaurant',
  'kitchen.queue',
  'orders.prepare',
  'deliveries.view',
  'deliveries.update',
  'availability.toggle',
  'restaurants.view',
  'orders.create',
  'orders.view_own',
  'profile.manage',
  'promotions.manage',
  'refunds.manage',
  'reports.export',
  'permissions.assign',
];

export function getRoleDefinition(role: string) {
  return dbRoles().find((entry) => entry.name === role);
}

export function hasPermission(role: string, permission: string) {
  const definition = getRoleDefinition(role);
  return Boolean(definition?.permissions.includes(permission));
}

export function isCoreRole(roleName: string) {
  return coreRoles.includes(roleName as CoreRole);
}

export function sortRoleDefinitions(roles: RoleDefinition[]) {
  return [...roles].sort((left, right) => left.label.localeCompare(right.label));
}
