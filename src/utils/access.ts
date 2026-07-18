import { appEnv } from '@/config/env';
import type {
  AccessWindow,
  AccessWindowState,
  PermissionKey,
  RoleAssignment,
  RoleDefinition,
  User,
  UserRole,
  UserStatus,
} from '@/types';

export interface AccessWindowEvaluation {
  state: AccessWindowState;
  isActive: boolean;
  timezone: string;
  nextAllowedAt: string | null;
  message: string;
}

export type WorkspaceArea = 'admin' | 'partner' | 'kitchen' | 'rider' | 'customer';

const weekdayMap: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const adminWorkspacePermissions = new Set<PermissionKey>([
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
  'customers.read',
  'customers.manage',
  'customers.blacklist',
  'riders.read',
  'riders.manage',
  'riders.status.update',
  'zones.read',
  'zones.manage',
  'fees.manage',
  'surge.manage',
  'analytics.read',
  'reports.export',
  'users.manage',
]);

const partnerWorkspacePermissions = new Set<PermissionKey>([
  'branches.manage',
  'menus.read',
  'menus.manage',
  'menus.availability.update',
  'promotions.read',
  'promotions.manage',
]);

const kitchenWorkspacePermissions = new Set<PermissionKey>([
  'orders.accept',
  'orders.reject',
  'orders.status.update',
]);

const riderWorkspacePermissions = new Set<PermissionKey>([
  'dispatch.read',
  'dispatch.assign',
  'riders.status.update',
]);

function coerceDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseTime(value?: string | null) {
  if (!value) {
    return null;
  }

  const [hours, minutes] = value.split(':').map((part) => Number.parseInt(part, 10));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return null;
  }

  return (hours * 60) + minutes;
}

function getZonedParts(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
  );

  return {
    weekday: weekdayMap[parts.weekday] ?? 0,
    year: Number.parseInt(parts.year ?? '0', 10),
    month: Number.parseInt(parts.month ?? '1', 10),
    day: Number.parseInt(parts.day ?? '1', 10),
    hour: Number.parseInt(parts.hour ?? '0', 10),
    minute: Number.parseInt(parts.minute ?? '0', 10),
  };
}

function formatWindowMoment(value: string | null, timezone: string) {
  if (!value) {
    return null;
  }

  const date = coerceDate(value);
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function isWithinDailyWindow(window: AccessWindow, date: Date, timezone: string) {
  const start = parseTime(window.startTime);
  const end = parseTime(window.endTime);
  if (start === null || end === null) {
    return true;
  }

  const parts = getZonedParts(date, timezone);
  const currentMinutes = (parts.hour * 60) + parts.minute;

  if (start === end) {
    return true;
  }

  if (end > start) {
    return currentMinutes >= start && currentMinutes <= end;
  }

  return currentMinutes >= start || currentMinutes <= end;
}

function isWithinAllowedDays(window: AccessWindow, date: Date, timezone: string) {
  if (!window.allowedDays?.length) {
    return true;
  }

  const parts = getZonedParts(date, timezone);
  return window.allowedDays.includes(parts.weekday);
}

function findNextAllowedAt(window: AccessWindow, referenceDate: Date) {
  for (let step = 1; step <= 14 * 48; step += 1) {
    const candidate = new Date(referenceDate.getTime() + (step * 30 * 60 * 1000));

    const validFrom = coerceDate(window.validFrom);
    const validUntil = coerceDate(window.validUntil) ?? coerceDate(window.temporaryExpiresAt);

    if (validFrom && candidate < validFrom) {
      continue;
    }

    if (validUntil && candidate > validUntil) {
      return null;
    }

    if (!isWithinAllowedDays(window, candidate, window.timezone)) {
      continue;
    }

    if (!isWithinDailyWindow(window, candidate, window.timezone)) {
      continue;
    }

    return candidate.toISOString();
  }

  return null;
}

function buildEvaluation(state: AccessWindowState, timezone: string, nextAllowedAt: string | null, message: string): AccessWindowEvaluation {
  return {
    state,
    isActive: state === 'active',
    timezone,
    nextAllowedAt,
    message,
  };
}

export function buildRoleAssignment(input: {
  userId?: string;
  roleId?: string | null;
  roleName: UserRole;
  restaurantId?: string | null;
  branchIds?: string[];
  accessWindow?: AccessWindow | null;
}): RoleAssignment {
  const restaurantIds = input.restaurantId ? [input.restaurantId] : [];

  return {
    id: `assignment-${crypto.randomUUID()}`,
    userId: input.userId,
    roleId: input.roleId ?? null,
    roleName: input.roleName,
    restaurantIds,
    branchIds: input.branchIds ?? [],
    accessWindow: input.accessWindow ?? null,
  };
}

export function getPrimaryRoleAssignment(user: User | null | undefined) {
  if (!user) {
    return null;
  }

  if (user.roleAssignments?.length) {
    return user.roleAssignments[0] ?? null;
  }

  return {
    id: `assignment-legacy-${user.id}`,
    userId: user.id,
    roleId: null,
    roleName: user.role,
    restaurantIds: user.restaurantId ? [user.restaurantId] : [],
    branchIds: [],
    accessWindow: null,
  } satisfies RoleAssignment;
}

export function getPrimaryRoleName(user: User | null | undefined) {
  return getPrimaryRoleAssignment(user)?.roleName ?? user?.role ?? null;
}

export function getPrimaryRestaurantId(user: User | null | undefined) {
  const assignment = getPrimaryRoleAssignment(user);
  return assignment?.restaurantIds?.[0] ?? user?.restaurantId ?? null;
}

export function getPrimaryAccessWindow(user: User | null | undefined) {
  return getPrimaryRoleAssignment(user)?.accessWindow ?? null;
}

export function evaluateAccessWindow(window?: AccessWindow | null, referenceDate: Date = new Date()) {
  const timezone = window?.timezone || appEnv.defaultTimezone;
  if (!window) {
    return buildEvaluation('active', timezone, null, 'Access is active with no scheduling restriction.');
  }

  const validFrom = coerceDate(window.validFrom);
  const validUntil = coerceDate(window.temporaryExpiresAt) ?? coerceDate(window.validUntil);

  if (validUntil && referenceDate > validUntil) {
    return buildEvaluation('expired', timezone, null, 'This access window has expired.');
  }

  if (validFrom && referenceDate < validFrom) {
    return buildEvaluation(
      'scheduled',
      timezone,
      validFrom.toISOString(),
      `Access starts ${formatWindowMoment(validFrom.toISOString(), timezone) ?? validFrom.toISOString()}.`,
    );
  }

  const nextAllowedAt = findNextAllowedAt(window, referenceDate);

  if (!isWithinAllowedDays(window, referenceDate, timezone)) {
    return buildEvaluation(
      'outside_days',
      timezone,
      nextAllowedAt,
      nextAllowedAt
        ? `Access is outside the allowed days. Next window opens ${formatWindowMoment(nextAllowedAt, timezone)}.`
        : 'Access is outside the allowed days.',
    );
  }

  if (!isWithinDailyWindow(window, referenceDate, timezone)) {
    return buildEvaluation(
      'outside_hours',
      timezone,
      nextAllowedAt,
      nextAllowedAt
        ? `Access is outside the allowed shift. Next window opens ${formatWindowMoment(nextAllowedAt, timezone)}.`
        : 'Access is outside the allowed shift.',
    );
  }

  return buildEvaluation('active', timezone, null, 'Access is active in the current window.');
}

export function getUserStatusLabel(status: UserStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getUserPermissions(user: User | null | undefined, roles: RoleDefinition[]) {
  if (!user) {
    return [] as PermissionKey[];
  }

  const roleAssignments = user.roleAssignments?.length ? user.roleAssignments : [getPrimaryRoleAssignment(user)].filter(Boolean) as RoleAssignment[];
  const permissions = new Set<PermissionKey>();

  roleAssignments.forEach((assignment) => {
    const definition = roles.find((role) => role.name === assignment.roleName || role.id === assignment.roleId);
    definition?.permissions.forEach((permission) => permissions.add(permission));
  });

  return [...permissions].sort();
}

export function isUserStatusActive(status: UserStatus | undefined) {
  return (status ?? 'active') === 'active';
}

export function evaluateUserOperationalAccess(user: User | null | undefined, referenceDate: Date = new Date()) {
  if (!user) {
    return buildEvaluation('expired', appEnv.defaultTimezone, null, 'No authenticated user is available.');
  }

  if (!isUserStatusActive(user.status)) {
    return buildEvaluation('expired', appEnv.defaultTimezone, null, `This account is ${user.status}.`);
  }

  if (!user.shiftActive) {
    return buildEvaluation('outside_hours', appEnv.defaultTimezone, null, 'Operational access is currently paused for this user.');
  }

  return evaluateAccessWindow(getPrimaryAccessWindow(user), referenceDate);
}

export function resolveWorkspaceArea(user: User | null | undefined, permissions: PermissionKey[] = []) {
  if (!user) {
    return 'customer' as WorkspaceArea;
  }

  const role = getPrimaryRoleName(user);
  if (role === 'customer') {
    return 'customer';
  }
  if (role === 'admin' || role === 'operations_manager' || role === 'support_agent') {
    return 'admin';
  }
  if (role === 'owner' || role === 'branch_manager') {
    return 'partner';
  }
  if (role === 'kitchen') {
    return 'kitchen';
  }
  if (role === 'rider') {
    return 'rider';
  }

  if (permissions.some((permission) => adminWorkspacePermissions.has(permission))) {
    return 'admin';
  }
  if (permissions.some((permission) => partnerWorkspacePermissions.has(permission))) {
    return 'partner';
  }
  if (permissions.some((permission) => kitchenWorkspacePermissions.has(permission))) {
    return 'kitchen';
  }
  if (permissions.some((permission) => riderWorkspacePermissions.has(permission))) {
    return 'rider';
  }

  return role === 'customer' ? 'customer' : 'admin';
}

export function getWorkspaceHome(area: WorkspaceArea) {
  switch (area) {
    case 'admin':
      return { name: 'admin-overview' };
    case 'partner':
      return { name: 'partner-overview' };
    case 'kitchen':
    case 'rider':
      return { name: 'customer-account-dashboard' };
    case 'customer':
    default:
      return { name: 'customer-account-dashboard' };
  }
}

export function canAccessWorkspace(area: WorkspaceArea, user: User | null | undefined, permissions: PermissionKey[] = []) {
  if (area === 'customer' && user && permissions.includes('profile.manage')) {
    return true;
  }

  return resolveWorkspaceArea(user, permissions) === area;
}

