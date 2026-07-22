import type { AdminCategory, AdminProduct, MenuCategory, MenuCategoryInput, MenuItem, MenuItemInput } from '@/types';
import api from '@/services/api';
import { unwrap, useBackendApi } from '@/services/backend';
import { cachedGet, clearApiCache } from '@/services/request-cache';
import { createActivityLog } from '@/services/activity-log.service';
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
  if (useBackendApi) {
    const restaurant = await cachedGet<{ menuCategories: MenuCategory[] }>('/restaurants/' + restaurantId);
    return restaurant?.menuCategories ?? [];
  }
  const restaurant = await getRestaurantById(restaurantId);
  return restaurant?.menuCategories ?? [];
}

export async function listAdminProducts() {
  if (useBackendApi) return cachedGet<AdminProduct[]>('/menus/products');
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
  if (useBackendApi) return cachedGet<AdminCategory[]>('/menus/categories');
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
  if (useBackendApi) {
    const category = unwrap<MenuCategory>(await api.post('/menus/categories', payload));
    clearApiCache('/menus');
    clearApiCache('/restaurants');
    return category;
  }
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

  await createActivityLog({
    domain: 'menu',
    action: 'menu.category_created',
    title: `Created category ${category.name}`,
    description: `${restaurant.name} added the ${category.name} category to the menu.`,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    metadata: {
      categoryId: category.id,
      categoryName: category.name,
    },
  });

  return category;
}

export async function updateMenuCategory(categoryId: string, payload: MenuCategoryInput) {
  if (useBackendApi) {
    const category = unwrap<MenuCategory>(await api.put('/menus/categories/' + categoryId, payload));
    clearApiCache('/menus');
    clearApiCache('/restaurants');
    return category;
  }
  const restaurants = dbRestaurants();
  let movedCategory: MenuCategory | null = null;
  let sourceRestaurantName: string | null = null;
  let previousCategoryName: string | null = null;

  for (const restaurant of restaurants) {
    const index = restaurant.menuCategories.findIndex((category) => category.id === categoryId);
    if (index >= 0) {
      movedCategory = restaurant.menuCategories[index];
      sourceRestaurantName = restaurant.name;
      previousCategoryName = movedCategory.name;
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

  await createActivityLog({
    domain: 'menu',
    action: 'menu.category_updated',
    title: `Updated category ${nextCategory.name}`,
    description: `${targetRestaurant.name} updated the ${previousCategoryName ?? nextCategory.name} category.`,
    restaurantId: targetRestaurant.id,
    restaurantName: targetRestaurant.name,
    metadata: {
      categoryId,
      previousCategoryName,
      nextCategoryName: nextCategory.name,
      sourceRestaurantName,
      targetRestaurantName: targetRestaurant.name,
      itemCount: nextCategory.items.length,
    },
  });

  return nextCategory;
}

export async function deleteMenuCategory(categoryId: string) {
  if (useBackendApi) { await api.delete('/menus/categories/' + categoryId); clearApiCache('/menus'); clearApiCache('/restaurants'); return true; }
  const restaurants = dbRestaurants();
  let removed = false;
  let removedCategoryName: string | null = null;
  let removedRestaurantId: string | null = null;
  let removedRestaurantName: string | null = null;

  for (const restaurant of restaurants) {
    const category = restaurant.menuCategories.find((entry) => entry.id === categoryId);
    if (!category) {
      continue;
    }
    if (category.items.length > 0) {
      throw new Error('Category still has products. Delete or move those products before removing the category.');
    }
    removedCategoryName = category.name;
    removedRestaurantId = restaurant.id;
    removedRestaurantName = restaurant.name;
    restaurant.menuCategories = restaurant.menuCategories.filter((entry) => entry.id !== categoryId);
    removed = true;
  }

  if (!removed) {
    throw new Error('Category not found.');
  }

  saveRestaurants(restaurants);

  await createActivityLog({
    domain: 'menu',
    action: 'menu.category_deleted',
    title: `Deleted category ${removedCategoryName ?? categoryId}`,
    description: `${removedRestaurantName} removed the ${removedCategoryName} category from the menu.`,
    restaurantId: removedRestaurantId,
    restaurantName: removedRestaurantName,
    metadata: {
      categoryId,
      categoryName: removedCategoryName,
    },
  });

  return true;
}

export async function createMenuItem(payload: MenuItemInput) {
  if (useBackendApi) {
    const item = unwrap<MenuItem>(await api.post('/menus/items', payload));
    clearApiCache('/menus');
    clearApiCache('/restaurants');
    return item;
  }
  const { restaurants, restaurant, category } = findOrCreateCategory(payload.restaurantId, payload.categoryId, payload.categoryName);
  const item = buildItem(payload);
  category.items.unshift(item);
  saveRestaurants(restaurants);

  await createActivityLog({
    domain: 'menu',
    action: 'menu.item_created',
    title: `Created menu item ${item.name}`,
    description: `${restaurant.name} added ${item.name} to ${category.name}.`,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    metadata: {
      categoryId: category.id,
      categoryName: category.name,
      itemId: item.id,
      itemName: item.name,
      price: item.price,
      available: item.available,
    },
  });

  return item;
}

export async function updateMenuItem(itemId: string, payload: MenuItemInput) {
  if (useBackendApi) {
    const item = unwrap<MenuItem>(await api.put('/menus/items/' + itemId, payload));
    clearApiCache('/menus');
    clearApiCache('/restaurants');
    return item;
  }
  const restaurants = dbRestaurants();
  let existingItem: MenuItem | null = null;
  let sourceRestaurantName: string | null = null;
  let sourceCategoryName: string | null = null;

  outer: for (const restaurant of restaurants) {
    for (const category of restaurant.menuCategories) {
      const index = category.items.findIndex((item) => item.id === itemId);
      if (index >= 0) {
        existingItem = category.items[index];
        sourceRestaurantName = restaurant.name;
        sourceCategoryName = category.name;
        category.items.splice(index, 1);
        break outer;
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

  await createActivityLog({
    domain: 'menu',
    action: 'menu.item_updated',
    title: `Updated menu item ${nextItem.name}`,
    description: `${targetRestaurant.name} updated ${nextItem.name} in ${targetCategory.name}.`,
    restaurantId: targetRestaurant.id,
    restaurantName: targetRestaurant.name,
    metadata: {
      itemId,
      itemName: nextItem.name,
      previousName: existingItem.name,
      sourceRestaurantName,
      sourceCategoryName,
      targetCategoryName: targetCategory.name,
      price: nextItem.price,
      available: nextItem.available,
    },
  });

  return nextItem;
}

export async function deleteMenuItem(itemId: string) {
  if (useBackendApi) { await api.delete('/menus/items/' + itemId); clearApiCache('/menus'); clearApiCache('/restaurants'); return true; }
  const restaurants = dbRestaurants();
  let removed = false;
  let removedItemName: string | null = null;
  let removedCategoryName: string | null = null;
  let removedRestaurantId: string | null = null;
  let removedRestaurantName: string | null = null;

  outer: for (const restaurant of restaurants) {
    for (const category of restaurant.menuCategories) {
      const item = category.items.find((entry) => entry.id === itemId);
      if (!item) {
        continue;
      }
      removed = true;
      removedItemName = item.name;
      removedCategoryName = category.name;
      removedRestaurantId = restaurant.id;
      removedRestaurantName = restaurant.name;
      category.items = category.items.filter((entry) => entry.id !== itemId);
      break outer;
    }
  }

  if (!removed) {
    throw new Error('Menu item not found.');
  }

  saveRestaurants(restaurants);

  await createActivityLog({
    domain: 'menu',
    action: 'menu.item_deleted',
    title: `Deleted menu item ${removedItemName ?? itemId}`,
    description: `${removedRestaurantName} removed ${removedItemName} from ${removedCategoryName}.`,
    restaurantId: removedRestaurantId,
    restaurantName: removedRestaurantName,
    metadata: {
      itemId,
      itemName: removedItemName,
      categoryName: removedCategoryName,
    },
  });

  return true;
}

export async function toggleItemAvailability(restaurantId: string, itemId: string) {
  if (useBackendApi) {
    const item = unwrap<MenuItem>(await api.patch('/menus/items/' + itemId + '/availability'));
    clearApiCache('/menus');
    clearApiCache('/restaurants');
    return item;
  }
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

  await createActivityLog({
    domain: 'menu',
    action: 'menu.item_availability_toggled',
    title: `${item.available ? 'Activated' : 'Paused'} menu item ${item.name}`,
    description: `${restaurant.name} ${item.available ? 'activated' : 'paused'} ${item.name} in ${category?.name}.`,
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    metadata: {
      itemId: item.id,
      itemName: item.name,
      categoryName: category?.name ?? null,
      available: item.available,
    },
  });

  return item;
}
