import type { Branch, BranchOperatingHour, Restaurant, RestaurantInput } from '@/types';
import api from '@/services/api';
import { unwrap, useBackendApi } from '@/services/backend';
import { cachedGet, clearApiCache } from '@/services/request-cache';
import { createActivityLog } from '@/services/activity-log.service';
import { dbOrders, dbRestaurants, saveRestaurants } from '@/utils/mockDb';
import { slugify } from '@/utils/slug';

function normalizeText(value: string) {
  return value.trim().toLowerCase();
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

function normalizeBranch(branch: Branch, index: number) {
  return {
    ...branch,
    id: branch.id || `branch-${crypto.randomUUID()}`,
    name: branch.name.trim(),
    zone: branch.zone.trim(),
    phone: branch.phone?.trim() || `+66 800 000 ${String(index + 1).padStart(3, '0')}`,
    status: branch.status ?? 'open',
    averagePrepMinutes: Number(branch.averagePrepMinutes ?? 18),
    minimumOrderAmount: Number(branch.minimumOrderAmount ?? 150),
    operatingHours: branch.operatingHours?.length ? branch.operatingHours : buildDefaultOperatingHours(),
    holidayClosures: branch.holidayClosures ?? [],
    lat: Number(branch.lat),
    lng: Number(branch.lng),
  } satisfies Branch;
}

function hasActiveRestaurantOrders(restaurantId: string) {
  const activeStatuses = new Set(['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'PICKED_UP', 'ON_THE_WAY']);
  return dbOrders().some((order) => order.restaurantId === restaurantId && activeStatuses.has(order.status));
}

export async function listRestaurants() {
  if (useBackendApi) return cachedGet<Restaurant[]>('/restaurants');
  return dbRestaurants();
}

export async function listOwnedRestaurants(restaurantIds: string[]) {
  if (useBackendApi) {
    const restaurants = await listRestaurants();
    const ids = new Set(restaurantIds);
    return restaurants.filter((restaurant) => ids.has(restaurant.id));
  }
  const ids = new Set(restaurantIds);
  return dbRestaurants().filter((restaurant) => ids.has(restaurant.id));
}

export async function listRestaurantCategories() {
  const sourceRestaurants = useBackendApi ? await listRestaurants() : dbRestaurants();
  const categoryMap = new Map<string, { name: string; slug: string; restaurantCount: number; productCount: number; restaurantNames: string[] }>();

  for (const restaurant of sourceRestaurants) {
    for (const category of restaurant.menuCategories) {
      const normalizedName = normalizeText(category.name);
      if (!normalizedName) {
        continue;
      }

      const existing = categoryMap.get(normalizedName);
      if (existing) {
        existing.restaurantCount += 1;
        existing.productCount += category.items.length;
        if (!existing.restaurantNames.includes(restaurant.name)) {
          existing.restaurantNames.push(restaurant.name);
        }
        continue;
      }

      categoryMap.set(normalizedName, {
        name: category.name,
        slug: slugify(category.name),
        restaurantCount: 1,
        productCount: category.items.length,
        restaurantNames: [restaurant.name],
      });
    }
  }

  return [...categoryMap.values()].sort((left, right) => {
    if (right.restaurantCount !== left.restaurantCount) {
      return right.restaurantCount - left.restaurantCount;
    }
    if (right.productCount !== left.productCount) {
      return right.productCount - left.productCount;
    }
    return left.name.localeCompare(right.name);
  });
}

export async function getRestaurantBySlug(slug: string) {
  if (useBackendApi) {
    const cached = (await listRestaurants()).find((restaurant) => restaurant.slug === slug);
    return cached ?? cachedGet<Restaurant | null>('/restaurants/' + slug);
  }
  return dbRestaurants().find((restaurant) => restaurant.slug === slug) ?? null;
}

export async function getRestaurantById(id: string) {
  if (useBackendApi) {
    const cached = (await listRestaurants()).find((restaurant) => restaurant.id === id);
    return cached ?? cachedGet<Restaurant | null>('/restaurants/' + id);
  }
  return dbRestaurants().find((restaurant) => restaurant.id === id) ?? null;
}

export async function searchRestaurants(query: string, category?: string) {
  const restaurants = useBackendApi ? await listRestaurants() : dbRestaurants();
  const term = normalizeText(query);
  const normalizedCategory = normalizeText(category ?? '');

  return restaurants.filter((restaurant) => {
    const matchesQuery =
      !term ||
      restaurant.name.toLowerCase().includes(term) ||
      restaurant.cuisine.some((item) => item.toLowerCase().includes(term)) ||
      restaurant.description?.toLowerCase().includes(term) ||
      restaurant.menuCategories.some(
        (menuCategory) =>
          menuCategory.name.toLowerCase().includes(term) ||
          menuCategory.items.some(
            (item) => item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term),
          ),
      );

    const matchesCategory =
      !normalizedCategory ||
      restaurant.menuCategories.some((menuCategory) => normalizeText(menuCategory.name) === normalizedCategory);

    return matchesQuery && matchesCategory && restaurant.partnerStatus !== 'suspended';
  });
}

export async function createRestaurant(payload: RestaurantInput) {
  if (useBackendApi) {
    const restaurant = unwrap<Restaurant>(await api.post('/restaurants', payload));
    clearApiCache('/restaurants');
    return restaurant;
  }
  const restaurants = dbRestaurants();
  const slug = slugify(payload.name);
  if (restaurants.some((restaurant) => restaurant.slug === slug)) {
    throw new Error('A restaurant with a similar slug already exists.');
  }

  const now = new Date().toISOString();
  const restaurant: Restaurant = {
    id: `rest-${crypto.randomUUID()}`,
    slug,
    rating: 4.5,
    menuCategories: [],
    name: payload.name.trim(),
    cuisine: payload.cuisine,
    description: payload.description.trim(),
    deliveryTime: payload.deliveryTime.trim(),
    deliveryFee: Number(payload.deliveryFee),
    coverImage: payload.coverImage.trim(),
    status: payload.status,
    verified: payload.verified,
    partnerStatus: payload.partnerStatus,
    suspensionReason: payload.suspensionReason?.trim() || null,
    commissionRate: Number(payload.commissionRate),
    reviewCount: Number(payload.reviewCount),
    heroColor: payload.heroColor.trim(),
    branches: payload.branches.map((branch, index) => normalizeBranch(branch, index)),
    createdAt: now,
    updatedAt: now,
  };

  saveRestaurants([restaurant, ...restaurants]);

  await createActivityLog({
    domain: 'restaurant',
    action: 'restaurant.created',
    title: `Created restaurant ${restaurant.name}`,
    description: `${restaurant.name} was added to the admin restaurant roster.`,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    metadata: {
      status: restaurant.status,
      verified: restaurant.verified,
      partnerStatus: restaurant.partnerStatus ?? 'pending',
      branchCount: restaurant.branches.length,
    },
  });

  return restaurant;
}

export async function updateRestaurant(restaurantId: string, payload: RestaurantInput) {
  if (useBackendApi) {
    const restaurant = unwrap<Restaurant>(await api.put('/restaurants/' + restaurantId, payload));
    clearApiCache('/restaurants');
    return restaurant;
  }
  const restaurants = dbRestaurants();
  const slug = slugify(payload.name);
  if (restaurants.some((restaurant) => restaurant.id !== restaurantId && restaurant.slug === slug)) {
    throw new Error('A restaurant with a similar slug already exists.');
  }

  const previousRestaurant = restaurants.find((restaurant) => restaurant.id === restaurantId) ?? null;
  if (!previousRestaurant) {
    throw new Error('Restaurant not found.');
  }

  if (
    previousRestaurant.partnerStatus !== payload.partnerStatus &&
    ['suspended', 'rejected'].includes(payload.partnerStatus) &&
    hasActiveRestaurantOrders(restaurantId)
  ) {
    throw new Error('This restaurant still has active orders. Resolve live service before suspending or rejecting it.');
  }

  const nextRestaurants = restaurants.map((restaurant) => {
    if (restaurant.id !== restaurantId) {
      return restaurant;
    }

    return {
      ...restaurant,
      name: payload.name.trim(),
      cuisine: payload.cuisine,
      description: payload.description.trim(),
      deliveryTime: payload.deliveryTime.trim(),
      deliveryFee: Number(payload.deliveryFee),
      coverImage: payload.coverImage.trim(),
      status: payload.status,
      verified: payload.verified,
      partnerStatus: payload.partnerStatus,
      suspensionReason: payload.suspensionReason?.trim() || null,
      commissionRate: Number(payload.commissionRate),
      reviewCount: Number(payload.reviewCount),
      heroColor: payload.heroColor.trim(),
      slug,
      branches: payload.branches.map((branch, index) => normalizeBranch(branch, index)),
      updatedAt: new Date().toISOString(),
    } satisfies Restaurant;
  });

  saveRestaurants(nextRestaurants);

  const updatedRestaurant = nextRestaurants.find((restaurant) => restaurant.id === restaurantId) ?? null;
  if (!updatedRestaurant) {
    throw new Error('Restaurant not found.');
  }

  await createActivityLog({
    domain: 'restaurant',
    action: 'restaurant.updated',
    title: `Updated restaurant ${updatedRestaurant.name}`,
    description: `${updatedRestaurant.name} had its operational profile updated.`,
    restaurantId: updatedRestaurant.id,
    restaurantName: updatedRestaurant.name,
    metadata: {
      previousStatus: previousRestaurant.status,
      nextStatus: updatedRestaurant.status,
      previousVerified: previousRestaurant.verified,
      nextVerified: updatedRestaurant.verified,
      previousPartnerStatus: previousRestaurant.partnerStatus ?? 'pending',
      nextPartnerStatus: updatedRestaurant.partnerStatus ?? 'pending',
      branchCount: updatedRestaurant.branches.length,
    },
  });

  return updatedRestaurant;
}

export async function setRestaurantVerification(restaurantId: string, verified: boolean) {
  if (useBackendApi) {
    const restaurant = unwrap<Restaurant>(await api.patch('/restaurants/' + restaurantId + '/verification', { verified }));
    clearApiCache('/restaurants');
    return restaurant;
  }
  const restaurants = dbRestaurants();
  const nextRestaurants = restaurants.map((restaurant) => {
    if (restaurant.id !== restaurantId) {
      return restaurant;
    }

    return {
      ...restaurant,
      verified,
      partnerStatus: verified ? 'verified' : restaurant.partnerStatus === 'suspended' ? 'suspended' : 'pending',
      updatedAt: new Date().toISOString(),
    } satisfies Restaurant;
  });

  const updatedRestaurant = nextRestaurants.find((restaurant) => restaurant.id === restaurantId) ?? null;
  if (!updatedRestaurant) {
    throw new Error('Restaurant not found.');
  }

  saveRestaurants(nextRestaurants);

  await createActivityLog({
    domain: 'restaurant',
    action: 'restaurant.verification_changed',
    title: `${verified ? 'Verified' : 'Unverified'} ${updatedRestaurant.name}`,
    description: `${updatedRestaurant.name} was marked as ${verified ? 'verified' : 'pending verification'}.`,
    restaurantId: updatedRestaurant.id,
    restaurantName: updatedRestaurant.name,
    metadata: {
      verified,
      status: updatedRestaurant.status,
      partnerStatus: updatedRestaurant.partnerStatus ?? 'pending',
    },
  });

  return updatedRestaurant;
}

export async function setRestaurantPartnerStatus(restaurantId: string, partnerStatus: Restaurant['partnerStatus'], suspensionReason?: string) {
  if (useBackendApi) {
    const restaurant = unwrap<Restaurant>(await api.patch('/restaurants/' + restaurantId + '/partner-status', { partnerStatus, suspensionReason }));
    clearApiCache('/restaurants');
    return restaurant;
  }
  const restaurants = dbRestaurants();
  const existing = restaurants.find((restaurant) => restaurant.id === restaurantId) ?? null;
  if (!existing) {
    throw new Error('Restaurant not found.');
  }

  if (!partnerStatus) {
    throw new Error('Partner status is required.');
  }

  if (partnerStatus === 'suspended' && !suspensionReason?.trim()) {
    throw new Error('A suspension reason is required.');
  }

  if (['suspended', 'rejected'].includes(partnerStatus) && hasActiveRestaurantOrders(restaurantId)) {
    throw new Error('This restaurant still has active orders. Resolve live service before suspending or rejecting it.');
  }

  const nextRestaurants = restaurants.map((restaurant) => {
    if (restaurant.id !== restaurantId) {
      return restaurant;
    }

    return {
      ...restaurant,
      partnerStatus,
      verified: partnerStatus === 'verified',
      suspensionReason: partnerStatus === 'suspended' ? suspensionReason?.trim() || null : null,
      updatedAt: new Date().toISOString(),
    } satisfies Restaurant;
  });

  saveRestaurants(nextRestaurants);

  const updatedRestaurant = nextRestaurants.find((restaurant) => restaurant.id === restaurantId) ?? null;
  if (!updatedRestaurant) {
    throw new Error('Restaurant not found.');
  }

  await createActivityLog({
    domain: 'restaurant',
    action: 'restaurant.partner_status_changed',
    title: `${updatedRestaurant.name} moved to ${partnerStatus}`,
    description: `${updatedRestaurant.name} is now ${partnerStatus}${updatedRestaurant.suspensionReason ? ` because ${updatedRestaurant.suspensionReason}` : ''}.`,
    restaurantId: updatedRestaurant.id,
    restaurantName: updatedRestaurant.name,
    metadata: {
      previousPartnerStatus: existing.partnerStatus ?? 'pending',
      nextPartnerStatus: partnerStatus,
      suspensionReason: updatedRestaurant.suspensionReason,
    },
  });

  return updatedRestaurant;
}

export async function deleteRestaurant(restaurantId: string) {
  if (useBackendApi) { await api.delete('/restaurants/' + restaurantId); clearApiCache('/restaurants'); return true; }
  if (hasActiveRestaurantOrders(restaurantId)) {
    throw new Error('This restaurant still has active orders and cannot be deleted yet.');
  }

  const removedRestaurant = dbRestaurants().find((restaurant) => restaurant.id === restaurantId) ?? null;
  const nextRestaurants = dbRestaurants().filter((restaurant) => restaurant.id !== restaurantId);
  saveRestaurants(nextRestaurants);

  if (removedRestaurant) {
    await createActivityLog({
      domain: 'restaurant',
      action: 'restaurant.deleted',
      title: `Deleted restaurant ${removedRestaurant.name}`,
      description: `${removedRestaurant.name} was removed from the admin restaurant roster.`,
      restaurantId: removedRestaurant.id,
      restaurantName: removedRestaurant.name,
      metadata: {
        status: removedRestaurant.status,
        verified: removedRestaurant.verified,
        partnerStatus: removedRestaurant.partnerStatus ?? 'pending',
        branchCount: removedRestaurant.branches.length,
      },
    });
  }

  return true;
}

export function buildBranch(): Branch {
  return {
    id: `branch-${crypto.randomUUID()}`,
    name: '',
    zone: '',
    phone: '+66 800 000 000',
    status: 'open',
    averagePrepMinutes: 18,
    minimumOrderAmount: 150,
    operatingHours: buildDefaultOperatingHours(),
    holidayClosures: [],
    lat: 13.7563,
    lng: 100.5018,
  };
}

export function flattenMenu(restaurant: Restaurant) {
  return restaurant.menuCategories.flatMap((category) =>
    category.items.map((item) => ({
      ...item,
      categoryName: category.name,
    })),
  );
}
