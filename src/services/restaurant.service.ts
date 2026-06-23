import type { Branch, CustomerCategorySummary, Restaurant, RestaurantInput } from '@/types';
import { dbRestaurants, saveRestaurants } from '@/utils/mockDb';
import { slugify } from '@/utils/slug';

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

export async function listRestaurants() {
  return dbRestaurants();
}

export async function listRestaurantCategories() {
  const categoryMap = new Map<string, CustomerCategorySummary>();

  for (const restaurant of dbRestaurants()) {
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
  return dbRestaurants().find((restaurant) => restaurant.slug === slug) ?? null;
}

export async function getRestaurantById(id: string) {
  return dbRestaurants().find((restaurant) => restaurant.id === id) ?? null;
}

export async function searchRestaurants(query: string, category?: string) {
  const restaurants = dbRestaurants();
  const term = normalizeText(query);
  const normalizedCategory = normalizeText(category ?? '');

  return restaurants.filter((restaurant) => {
    const matchesQuery =
      !term ||
      restaurant.name.toLowerCase().includes(term) ||
      restaurant.cuisine.some((item) => item.toLowerCase().includes(term)) ||
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

    return matchesQuery && matchesCategory;
  });
}

export async function createRestaurant(payload: RestaurantInput) {
  const restaurants = dbRestaurants();
  const slug = slugify(payload.name);
  if (restaurants.some((restaurant) => restaurant.slug === slug)) {
    throw new Error('A restaurant with a similar slug already exists.');
  }

  const restaurant: Restaurant = {
    id: `rest-${crypto.randomUUID()}`,
    slug,
    rating: 4.5,
    menuCategories: [],
    ...payload,
    branches: payload.branches.map((branch) => ({
      ...branch,
      id: branch.id || `branch-${crypto.randomUUID()}`,
    })),
  };

  saveRestaurants([restaurant, ...restaurants]);
  return restaurant;
}

export async function updateRestaurant(restaurantId: string, payload: RestaurantInput) {
  const restaurants = dbRestaurants();
  const slug = slugify(payload.name);
  if (restaurants.some((restaurant) => restaurant.id !== restaurantId && restaurant.slug === slug)) {
    throw new Error('A restaurant with a similar slug already exists.');
  }

  let updatedRestaurant: Restaurant | null = null;
  const nextRestaurants = restaurants.map((restaurant) => {
    if (restaurant.id !== restaurantId) {
      return restaurant;
    }

    updatedRestaurant = {
      ...restaurant,
      ...payload,
      slug,
      branches: payload.branches.map((branch) => ({
        ...branch,
        id: branch.id || `branch-${crypto.randomUUID()}`,
      })),
    };

    return updatedRestaurant;
  });

  saveRestaurants(nextRestaurants);
  return updatedRestaurant;
}

export async function deleteRestaurant(restaurantId: string) {
  const nextRestaurants = dbRestaurants().filter((restaurant) => restaurant.id !== restaurantId);
  saveRestaurants(nextRestaurants);
  return true;
}

export function buildBranch(): Branch {
  return {
    id: `branch-${crypto.randomUUID()}`,
    name: '',
    zone: '',
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
