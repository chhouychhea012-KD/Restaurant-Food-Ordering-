import analyticsData from '@/assets/data/analytics.json';
import notificationsData from '@/assets/data/notifications.json';
import ordersData from '@/assets/data/orders.json';
import restaurantsData from '@/assets/data/restaurants.json';
import rolesData from '@/assets/data/roles.json';
import usersData from '@/assets/data/users.json';
import type {
  ActivityLogEntry,
  AnalyticsSnapshot,
  AppNotification,
  Branch,
  BranchOperatingHour,
  HolidayClosure,
  Order,
  Restaurant,
  RoleDefinition,
  Session,
  User,
} from '@/types';
import { buildRoleAssignment } from './access';
import { clearStorage, readStorage, storageKeys, writeStorage } from './storage';

function mergeCoreRoles(storedRoles: RoleDefinition[]) {
  const seedRoles = rolesData as RoleDefinition[];
  const merged = seedRoles.map((seedRole) => {
    const storedRole = storedRoles.find((entry) => entry.name === seedRole.name);
    if (!storedRole) {
      return seedRole;
    }

    return {
      ...seedRole,
      ...storedRole,
      label: storedRole.label || seedRole.label,
      description: storedRole.description || seedRole.description,
      permissions: [...new Set([...(storedRole.permissions ?? []), ...(seedRole.permissions ?? [])])].sort(),
      isSystem: storedRole.isSystem ?? seedRole.isSystem,
    };
  });

  const customRoles = storedRoles.filter((storedRole) => !seedRoles.some((seedRole) => seedRole.name === storedRole.name));
  return [...merged, ...customRoles];
}

function buildDefaultOperatingHours(): BranchOperatingHour[] {
  return [
    { day: 0, label: 'Sun', open: '10:00', close: '21:00', closed: false },
    { day: 1, label: 'Mon', open: '10:00', close: '21:00', closed: false },
    { day: 2, label: 'Tue', open: '10:00', close: '21:00', closed: false },
    { day: 3, label: 'Wed', open: '10:00', close: '21:00', closed: false },
    { day: 4, label: 'Thu', open: '10:00', close: '21:00', closed: false },
    { day: 5, label: 'Fri', open: '10:00', close: '22:00', closed: false },
    { day: 6, label: 'Sat', open: '10:00', close: '22:00', closed: false },
  ];
}

function normalizeHolidayClosures(entries?: HolidayClosure[]) {
  return (entries ?? []).map((closure, index) => ({
    id: closure.id || `holiday-${index}`,
    date: closure.date,
    label: closure.label,
  }));
}

function normalizeBranch(branch: Branch) {
  return {
    ...branch,
    phone: branch.phone ?? '+855 12 000 000',
    status: branch.status ?? 'open',
    averagePrepMinutes: branch.averagePrepMinutes ?? 18,
    minimumOrderAmount: branch.minimumOrderAmount ?? 150,
    operatingHours: branch.operatingHours?.length ? branch.operatingHours : buildDefaultOperatingHours(),
    holidayClosures: normalizeHolidayClosures(branch.holidayClosures),
  } satisfies Branch;
}

function normalizeRestaurant(restaurant: Restaurant) {
  const now = new Date().toISOString();
  return {
    ...restaurant,
    description: restaurant.description ?? `${restaurant.name} is part of the Golden Land Restaurant demo marketplace with delivery-ready branches and seeded menu inventory.`,
    reviewCount: restaurant.reviewCount ?? Math.max(32, Math.round(restaurant.rating * 64)),
    partnerStatus: restaurant.partnerStatus ?? (restaurant.verified ? 'verified' : 'pending'),
    suspensionReason: restaurant.suspensionReason ?? null,
    commissionRate: restaurant.commissionRate ?? 0.18,
    branches: restaurant.branches.map((branch) => normalizeBranch(branch)),
    createdAt: restaurant.createdAt ?? now,
    updatedAt: restaurant.updatedAt ?? restaurant.createdAt ?? now,
  } satisfies Restaurant;
}

function mergeSeedRestaurants(storedRestaurants: Restaurant[]) {
  const seedRestaurants = (restaurantsData as Restaurant[]).map((restaurant) => normalizeRestaurant(restaurant));
  const merged = seedRestaurants.map((seedRestaurant) => {
    const storedRestaurant = storedRestaurants.find((entry) => entry.id === seedRestaurant.id);
    if (!storedRestaurant) {
      return seedRestaurant;
    }

    return normalizeRestaurant({
      ...seedRestaurant,
      ...storedRestaurant,
      branches: storedRestaurant.branches?.length ? storedRestaurant.branches : seedRestaurant.branches,
      menuCategories: storedRestaurant.menuCategories?.length ? storedRestaurant.menuCategories : seedRestaurant.menuCategories,
    });
  });

  const customRestaurants = storedRestaurants
    .filter((storedRestaurant) => !seedRestaurants.some((seedRestaurant) => seedRestaurant.id === storedRestaurant.id))
    .map((restaurant) => normalizeRestaurant(restaurant));

  return [...merged, ...customRestaurants];
}

function buildRoleAssignments(user: User, roles: RoleDefinition[]) {
  if (user.roleAssignments?.length) {
    return user.roleAssignments.map((assignment, index) => ({
      ...assignment,
      id: assignment.id || `assignment-${user.id}-${index}`,
      userId: assignment.userId ?? user.id,
      roleId: assignment.roleId ?? roles.find((role) => role.name === assignment.roleName)?.id ?? null,
      restaurantIds: assignment.restaurantIds ?? (user.restaurantId ? [user.restaurantId] : []),
      branchIds: assignment.branchIds ?? [],
      accessWindow: assignment.accessWindow ?? null,
    }));
  }

  const roleId = roles.find((role) => role.name === user.role)?.id ?? null;
  return [
    buildRoleAssignment({
      userId: user.id,
      roleId,
      roleName: user.role,
      restaurantId: user.restaurantId ?? null,
      accessWindow: null,
    }),
  ];
}

function normalizeUser(user: User, roles: RoleDefinition[]) {
  const now = new Date().toISOString();
  return {
    ...user,
    status: user.status ?? 'active',
    restaurantId: user.restaurantId ?? null,
    shiftActive: user.shiftActive ?? true,
    roleAssignments: buildRoleAssignments(user, roles),
    createdAt: user.createdAt ?? now,
    updatedAt: user.updatedAt ?? user.createdAt ?? now,
  } satisfies User;
}

function mergeSeedUsers(storedUsers: User[], roles: RoleDefinition[]) {
  const seedUsers = (usersData as User[]).map((user) => normalizeUser(user, roles));
  const merged = seedUsers.map((seedUser) => {
    const storedUser = storedUsers.find((entry) => entry.id === seedUser.id);
    if (!storedUser) {
      return seedUser;
    }

    return normalizeUser(
      {
        ...seedUser,
        ...storedUser,
        role: storedUser.role || seedUser.role,
      },
      roles,
    );
  });

  const customUsers = storedUsers
    .filter((storedUser) => !seedUsers.some((seedUser) => seedUser.id === storedUser.id))
    .map((user) => normalizeUser(user, roles));

  return [...merged, ...customUsers];
}

function formatSeedStatusLabel(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function buildInitialActivityLogs(orders: Order[], restaurants: Restaurant[]) {
  const logs: ActivityLogEntry[] = [];

  orders.forEach((order) => {
    order.timeline.forEach((entry, index) => {
      const isDispatchEvent = ['RIDER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY'].includes(entry.status);
      const createdAt = new Date(new Date(order.createdAt).getTime() + index * 7 * 60 * 1000).toISOString();
      const statusLabel = formatSeedStatusLabel(entry.status);

      logs.push({
        id: `log-seed-order-${order.id}-${index}`,
        createdAt,
        actorUserId: null,
        actorName: 'System Seed',
        actorRole: 'system',
        restaurantId: order.restaurantId,
        restaurantName: order.restaurantName,
        orderId: order.id,
        domain: isDispatchEvent ? 'dispatch' : 'order',
        action: isDispatchEvent ? 'dispatch.timeline_seeded' : 'order.timeline_seeded',
        title: `${order.id} moved to ${statusLabel}`,
        description: `${order.restaurantName} recorded a historical ${statusLabel} event for ${order.id}.`,
        metadata: {
          status: entry.status,
          seeded: true,
        },
      });
    });
  });

  restaurants.slice(0, 3).forEach((restaurant, index) => {
    logs.push({
      id: `log-seed-restaurant-${restaurant.id}`,
      createdAt: new Date(Date.now() - (index + 1) * 60 * 60 * 1000).toISOString(),
      actorUserId: null,
      actorName: 'System Seed',
      actorRole: 'system',
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      orderId: null,
      domain: 'system',
      action: 'system.audit_initialized',
      title: `Audit tracking initialized for ${restaurant.name}`,
      description: `${restaurant.name} is now included in the platform activity log for order, dispatch, menu, and refund events.`,
      metadata: {
        seeded: true,
        branchCount: restaurant.branches.length,
      },
    });
  });

  return logs.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

export async function seedDatabase() {
  const mergedRoles = mergeCoreRoles(readStorage<RoleDefinition[]>(storageKeys.roles, rolesData as RoleDefinition[]));
  writeStorage(storageKeys.roles, mergedRoles);

  const mergedUsers = mergeSeedUsers(readStorage<User[]>(storageKeys.users, usersData as User[]), mergedRoles);
  writeStorage(storageKeys.users, mergedUsers);

  const nextRestaurants = mergeSeedRestaurants(readStorage<Restaurant[]>(storageKeys.restaurants, restaurantsData as Restaurant[]));
  writeStorage(storageKeys.restaurants, nextRestaurants);

  if (!localStorage.getItem(storageKeys.orders)) {
    writeStorage(storageKeys.orders, ordersData);
  }
  if (!localStorage.getItem(storageKeys.activityLogs)) {
    const seededRestaurants = readStorage<Restaurant[]>(storageKeys.restaurants, restaurantsData as Restaurant[]);
    const seededOrders = readStorage<Order[]>(storageKeys.orders, ordersData as Order[]);
    writeStorage(storageKeys.activityLogs, buildInitialActivityLogs(seededOrders, seededRestaurants));
  }
  if (!localStorage.getItem(storageKeys.analytics)) {
    writeStorage(storageKeys.analytics, analyticsData);
  }
  if (!localStorage.getItem(storageKeys.notifications)) {
    writeStorage(storageKeys.notifications, notificationsData);
  }
}

export function dbUsers() {
  return mergeSeedUsers(readStorage<User[]>(storageKeys.users, usersData as User[]), dbRoles());
}

export function saveUsers(users: User[]) {
  writeStorage(storageKeys.users, mergeSeedUsers(users, dbRoles()));
}

export function dbRoles() {
  return mergeCoreRoles(readStorage<RoleDefinition[]>(storageKeys.roles, rolesData as RoleDefinition[]));
}

export function saveRoles(roles: RoleDefinition[]) {
  writeStorage(storageKeys.roles, mergeCoreRoles(roles));
}

export function dbRestaurants() {
  return mergeSeedRestaurants(readStorage<Restaurant[]>(storageKeys.restaurants, restaurantsData as Restaurant[]));
}

export function saveRestaurants(restaurants: Restaurant[]) {
  writeStorage(storageKeys.restaurants, mergeSeedRestaurants(restaurants));
}

export function dbOrders() {
  return readStorage<Order[]>(storageKeys.orders, ordersData as Order[]);
}

export function saveOrders(orders: Order[]) {
  writeStorage(storageKeys.orders, orders);
}

export function dbActivityLogs() {
  return readStorage<ActivityLogEntry[]>(storageKeys.activityLogs, []);
}

export function saveActivityLogs(logs: ActivityLogEntry[]) {
  writeStorage(storageKeys.activityLogs, logs);
}

export function dbAnalytics() {
  return readStorage<AnalyticsSnapshot>(storageKeys.analytics, analyticsData as AnalyticsSnapshot);
}

export function dbNotifications() {
  return readStorage<AppNotification[]>(storageKeys.notifications, notificationsData as AppNotification[]);
}

export function saveNotifications(notifications: AppNotification[]) {
  writeStorage(storageKeys.notifications, notifications);
}

export function readSession() {
  return readStorage<Session | null>(storageKeys.session, null);
}

export function saveSession(session: Session) {
  writeStorage(storageKeys.session, session);
}

export function clearSession() {
  clearStorage(storageKeys.session);
}
