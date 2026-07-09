import analyticsData from '@/assets/data/analytics.json';
import notificationsData from '@/assets/data/notifications.json';
import ordersData from '@/assets/data/orders.json';
import restaurantsData from '@/assets/data/restaurants.json';
import rolesData from '@/assets/data/roles.json';
import usersData from '@/assets/data/users.json';
import type { AnalyticsSnapshot, AppNotification, Order, Restaurant, RoleDefinition, Session, User } from '@/types';
import { clearStorage, readStorage, storageKeys, writeStorage } from './storage';

function mergeCoreRoles(storedRoles: RoleDefinition[]) {
  const seedRoles = rolesData as RoleDefinition[];
  const merged = seedRoles.map((seedRole) => {
    const storedRole = storedRoles.find((entry) => entry.name === seedRole.name);
    if (!storedRole) {
      return seedRole;
    }

    return {
      ...storedRole,
      label: storedRole.label || seedRole.label,
      description: storedRole.description || seedRole.description,
      permissions: [...new Set([...(storedRole.permissions ?? []), ...(seedRole.permissions ?? [])])].sort(),
    };
  });

  const customRoles = storedRoles.filter((storedRole) => !seedRoles.some((seedRole) => seedRole.name === storedRole.name));
  return [...merged, ...customRoles];
}

function mergeSeedRestaurants(storedRestaurants: Restaurant[]) {
  const seedRestaurants = restaurantsData as Restaurant[];
  const merged = seedRestaurants.map((seedRestaurant) => {
    const storedRestaurant = storedRestaurants.find((entry) => entry.id === seedRestaurant.id);
    if (!storedRestaurant) {
      return seedRestaurant;
    }

    return {
      ...seedRestaurant,
      ...storedRestaurant,
      branches: storedRestaurant.branches?.length ? storedRestaurant.branches : seedRestaurant.branches,
      menuCategories: storedRestaurant.menuCategories?.length
        ? storedRestaurant.menuCategories
        : seedRestaurant.menuCategories,
    };
  });

  const customRestaurants = storedRestaurants.filter(
    (storedRestaurant) => !seedRestaurants.some((seedRestaurant) => seedRestaurant.id === storedRestaurant.id),
  );

  return [...merged, ...customRestaurants];
}

export async function seedDatabase() {
  if (!localStorage.getItem(storageKeys.users)) {
    writeStorage(storageKeys.users, usersData);
  }
  if (!localStorage.getItem(storageKeys.roles)) {
    writeStorage(storageKeys.roles, rolesData);
  } else {
    const nextRoles = mergeCoreRoles(readStorage<RoleDefinition[]>(storageKeys.roles, rolesData as RoleDefinition[]));
    writeStorage(storageKeys.roles, nextRoles);
  }
  if (!localStorage.getItem(storageKeys.restaurants)) {
    writeStorage(storageKeys.restaurants, restaurantsData);
  } else {
    const nextRestaurants = mergeSeedRestaurants(readStorage<Restaurant[]>(storageKeys.restaurants, restaurantsData as Restaurant[]));
    writeStorage(storageKeys.restaurants, nextRestaurants);
  }
  if (!localStorage.getItem(storageKeys.orders)) {
    writeStorage(storageKeys.orders, ordersData);
  }
  if (!localStorage.getItem(storageKeys.analytics)) {
    writeStorage(storageKeys.analytics, analyticsData);
  }
  if (!localStorage.getItem(storageKeys.notifications)) {
    writeStorage(storageKeys.notifications, notificationsData);
  }
}

export function dbUsers() {
  return readStorage<User[]>(storageKeys.users, usersData as User[]);
}

export function saveUsers(users: User[]) {
  writeStorage(storageKeys.users, users);
}

export function dbRoles() {
  return readStorage<RoleDefinition[]>(storageKeys.roles, rolesData as RoleDefinition[]);
}

export function saveRoles(roles: RoleDefinition[]) {
  writeStorage(storageKeys.roles, roles);
}

export function dbRestaurants() {
  return readStorage<Restaurant[]>(storageKeys.restaurants, restaurantsData as Restaurant[]);
}

export function saveRestaurants(restaurants: Restaurant[]) {
  writeStorage(storageKeys.restaurants, restaurants);
}

export function dbOrders() {
  return readStorage<Order[]>(storageKeys.orders, ordersData as Order[]);
}

export function saveOrders(orders: Order[]) {
  writeStorage(storageKeys.orders, orders);
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
