import type { AdminCategory, AdminProduct, MenuCategory, MenuCategoryInput, MenuItem, MenuItemInput } from '@/types';
import { dbRestaurants, saveRestaurants } from '@/utils/mockDb';
import { getRestaurantById } from './restaurant.service';

function normalizeCategoryName(value: string) {
  return value.trim().toLowerCase();
}

function buildCategory(name: string): MenuCategory {
  return {
    id: `cat-${crypto.randomUUID()}`,
    name: name.trim(),
    items: [],
  };
}

function buildItem(payload: Omit<MenuItemInput, 'restaurantId' | 'categoryId' | 'categoryName'>, itemId?: string): MenuItem {
  return {
    id: itemId ?? `item-${crypto.randomUUID()}`,
    name: payload.name.trim(),
    description: payload.description.trim(),
    price: Number(payload.price),
    image: payload.image.trim(),
    available: payload.available,
    prepTime: Number(payload.prepTime),
    modifiers: payload.modifiers.map((modifier) => modifier.trim()).filter(Boolean),
  };
}

function findOrCreateCategory(restaurantId: string, categoryId: string | undefined, categoryName: string) {
  const restaurants = dbRestaurants();
  const restaurant = restaurants.find((entry) => entry.id === restaurantId);
  if (!restaurant) {
    throw new Error('Restaurant not found.');
  }

  let category = restaurant.menuCategories.find((entry) => entry.id === categoryId);
  if (!category) {
    category = restaurant.menuCategories.find(
      (entry) => normalizeCategoryName(entry.name) === normalizeCategoryName(categoryName),
    );
  }
  if (!category) {
    category = buildCategory(categoryName);
    restaurant.menuCategories.push(category);
  }

  return { restaurants, restaurant, category };
}

export async function getMenuForRestaurant(restaurantId: string) {
  const restaurant = await getRestaurantById(restaurantId);
  return restaurant?.menuCategories ?? [];
}

export async function listAdminProducts() {
  return dbRestaurants().flatMap((restaurant) =>
    restaurant.menuCategories.flatMap((category) =>
      category.items.map(
        (item): AdminProduct => ({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          categoryId: category.id,
          categoryName: category.name,
          item,
        }),
      ),
    ),
  );
}

export async function listAdminCategories() {
  return dbRestaurants().flatMap((restaurant) =>
    restaurant.menuCategories.map(
      (category): AdminCategory => ({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        category,
      }),
    ),
  );
}

export async function createMenuCategory(payload: MenuCategoryInput) {
  const restaurants = dbRestaurants();
  const restaurant = restaurants.find((entry) => entry.id === payload.restaurantId);
  if (!restaurant) {
    throw new Error('Restaurant not found.');
  }

  const normalizedName = normalizeCategoryName(payload.name);
  if (!normalizedName) {
    throw new Error('Category name is required.');
  }
  if (restaurant.menuCategories.some((category) => normalizeCategoryName(category.name) === normalizedName)) {
    throw new Error('This restaurant already has a category with that name.');
  }

  const category = buildCategory(payload.name);
  restaurant.menuCategories.unshift(category);
  saveRestaurants(restaurants);
  return category;
}

export async function updateMenuCategory(categoryId: string, payload: MenuCategoryInput) {
  const restaurants = dbRestaurants();
  let movedCategory: MenuCategory | null = null;

  for (const restaurant of restaurants) {
    const index = restaurant.menuCategories.findIndex((category) => category.id === categoryId);
    if (index >= 0) {
      movedCategory = restaurant.menuCategories[index];
      restaurant.menuCategories.splice(index, 1);
      break;
    }
  }

  if (!movedCategory) {
    throw new Error('Category not found.');
  }

  const targetRestaurant = restaurants.find((entry) => entry.id === payload.restaurantId);
  if (!targetRestaurant) {
    throw new Error('Target restaurant not found.');
  }

  const normalizedName = normalizeCategoryName(payload.name);
  if (!normalizedName) {
    throw new Error('Category name is required.');
  }
  if (targetRestaurant.menuCategories.some((category) => category.id !== categoryId && normalizeCategoryName(category.name) === normalizedName)) {
    throw new Error('This restaurant already has a category with that name.');
  }

  const nextCategory: MenuCategory = {
    ...movedCategory,
    id: categoryId,
    name: payload.name.trim(),
  };
  targetRestaurant.menuCategories.unshift(nextCategory);
  saveRestaurants(restaurants);
  return nextCategory;
}

export async function deleteMenuCategory(categoryId: string) {
  const restaurants = dbRestaurants();
  let removed = false;

  for (const restaurant of restaurants) {
    const category = restaurant.menuCategories.find((entry) => entry.id === categoryId);
    if (!category) {
      continue;
    }
    if (category.items.length > 0) {
      throw new Error('Category still has products. Delete or move those products before removing the category.');
    }
    restaurant.menuCategories = restaurant.menuCategories.filter((entry) => entry.id !== categoryId);
    removed = true;
  }

  if (!removed) {
    throw new Error('Category not found.');
  }

  saveRestaurants(restaurants);
  return true;
}

export async function createMenuItem(payload: MenuItemInput) {
  const { restaurants, category } = findOrCreateCategory(payload.restaurantId, payload.categoryId, payload.categoryName);
  const item = buildItem(payload);
  category.items.unshift(item);
  saveRestaurants(restaurants);
  return item;
}

export async function updateMenuItem(itemId: string, payload: MenuItemInput) {
  const restaurants = dbRestaurants();
  let existingItem: MenuItem | null = null;

  for (const restaurant of restaurants) {
    for (const category of restaurant.menuCategories) {
      const index = category.items.findIndex((item) => item.id === itemId);
      if (index >= 0) {
        existingItem = category.items[index];
        category.items.splice(index, 1);
      }
    }
  }

  if (!existingItem) {
    throw new Error('Menu item not found.');
  }

  const targetRestaurant = restaurants.find((entry) => entry.id === payload.restaurantId);
  if (!targetRestaurant) {
    throw new Error('Target restaurant not found.');
  }

  let targetCategory = targetRestaurant.menuCategories.find((entry) => entry.id === payload.categoryId);
  if (!targetCategory) {
    targetCategory = targetRestaurant.menuCategories.find(
      (entry) => normalizeCategoryName(entry.name) === normalizeCategoryName(payload.categoryName),
    );
  }
  if (!targetCategory) {
    targetCategory = buildCategory(payload.categoryName);
    targetRestaurant.menuCategories.push(targetCategory);
  }

  const nextItem = buildItem(payload, itemId);
  targetCategory.items.unshift(nextItem);
  saveRestaurants(restaurants);
  return nextItem;
}

export async function deleteMenuItem(itemId: string) {
  const restaurants = dbRestaurants();
  let removed = false;

  for (const restaurant of restaurants) {
    for (const category of restaurant.menuCategories) {
      const before = category.items.length;
      category.items = category.items.filter((item) => item.id !== itemId);
      if (category.items.length !== before) {
        removed = true;
      }
    }
  }

  if (!removed) {
    throw new Error('Menu item not found.');
  }

  saveRestaurants(restaurants);
  return true;
}

export async function toggleItemAvailability(restaurantId: string, itemId: string) {
  const restaurants = dbRestaurants();
  const restaurant = restaurants.find((entry) => entry.id === restaurantId) ?? (await getRestaurantById(restaurantId));
  if (!restaurant) {
    throw new Error('Restaurant not found.');
  }

  const category = restaurant.menuCategories.find((entry) => entry.items.some((item) => item.id === itemId));
  const item = category?.items.find((entry) => entry.id === itemId);
  if (!item) {
    throw new Error('Menu item not found.');
  }

  item.available = !item.available;
  saveRestaurants(restaurants);
  return item;
}
