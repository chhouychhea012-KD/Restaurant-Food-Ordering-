export const storageKeys = {
  users: 'flavorfleet.users',
  roles: 'flavorfleet.roles',
  restaurants: 'flavorfleet.restaurants',
  orders: 'flavorfleet.orders',
  activityLogs: 'flavorfleet.activityLogs',
  analytics: 'flavorfleet.analytics',
  notifications: 'flavorfleet.notifications',
  session: 'flavorfleet.session',
  cart: 'flavorfleet.cart',
  vouchers: 'flavorfleet.vouchers',
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function clearStorage(key: string) {
  localStorage.removeItem(key);
}

export function clearAppStorage() {
  Object.values(storageKeys).forEach((key) => {
    clearStorage(key);
  });
}
