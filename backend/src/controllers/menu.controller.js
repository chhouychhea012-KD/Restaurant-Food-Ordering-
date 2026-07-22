const crypto = require('crypto');
const { MenuCategory, MenuItem, Restaurant } = require('../models');
const { ApiError, created, noContent, ok } = require('../utils/http');
const { serializeMenuCategory, serializeMenuItem } = require('../services/serializer.service');
const workflow = require('../services/workflow.service');

async function listProducts(req, res) {
  const restaurants = await Restaurant.findAll({ include: [{ model: MenuCategory, as: 'menuCategories', include: [{ model: MenuItem, as: 'items' }] }] });
  return ok(
    res,
    restaurants.flatMap((restaurant) =>
      restaurant.menuCategories.flatMap((category) =>
        category.items.map((item) => ({
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          categoryId: category.id,
          categoryName: category.name,
          item: serializeMenuItem(item),
        })),
      ),
    ),
  );
}

async function listCategories(req, res) {
  const restaurants = await Restaurant.findAll({ include: [{ model: MenuCategory, as: 'menuCategories', include: [{ model: MenuItem, as: 'items' }] }] });
  return ok(
    res,
    restaurants.flatMap((restaurant) =>
      restaurant.menuCategories.map((category) => ({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        category: serializeMenuCategory(category),
      })),
    ),
  );
}

async function createCategory(req, res) {
  const category = await MenuCategory.create({ id: `cat-${crypto.randomUUID()}`, restaurantId: req.body.restaurantId, name: req.body.name });
  await workflow.createActivity(req, { domain: 'menu', action: 'menu.category_created', title: 'Created category ' + category.name, description: 'A menu category was created.', restaurantId: category.restaurantId, metadata: { categoryId: category.id, categoryName: category.name } });
  return created(res, serializeMenuCategory(category));
}

async function updateCategory(req, res) {
  const category = await MenuCategory.findByPk(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }
  await category.update({ restaurantId: req.body.restaurantId, name: req.body.name });
  await workflow.createActivity(req, { domain: 'menu', action: 'menu.category_updated', title: 'Updated category ' + category.name, description: 'A menu category was updated.', restaurantId: category.restaurantId, metadata: { categoryId: category.id, categoryName: category.name } });
  return ok(res, serializeMenuCategory(category));
}

async function deleteCategory(req, res) {
  const category = await MenuCategory.findByPk(req.params.id, { include: [{ model: MenuItem, as: 'items' }] });
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }
  if (category.items.length) {
    throw new ApiError(422, 'Category still has products.');
  }
  await workflow.createActivity(req, { domain: 'menu', action: 'menu.category_deleted', title: 'Deleted category ' + category.name, description: 'A menu category was deleted.', restaurantId: category.restaurantId, metadata: { categoryId: category.id, categoryName: category.name } });
  await category.destroy();
  return noContent(res);
}

async function createItem(req, res) {
  let category = req.body.categoryId ? await MenuCategory.findByPk(req.body.categoryId) : null;
  if (!category) {
    category = await MenuCategory.create({ id: `cat-${crypto.randomUUID()}`, restaurantId: req.body.restaurantId, name: req.body.categoryName });
  }
  const item = await MenuItem.create({
    id: `item-${crypto.randomUUID()}`,
    categoryId: category.id,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    image: req.body.image,
    available: req.body.available !== false,
    prepTime: req.body.prepTime || 15,
    modifiers: req.body.modifiers || [],
  });
  await workflow.createActivity(req, { domain: 'menu', action: 'menu.item_created', title: 'Created menu item ' + item.name, description: 'A menu item was created.', restaurantId: category.restaurantId, metadata: { categoryId: category.id, itemId: item.id, itemName: item.name, price: Number(item.price), available: Boolean(item.available) } });
  return created(res, serializeMenuItem(item));
}

async function updateItem(req, res) {
  const item = await MenuItem.findByPk(req.params.id);
  if (!item) {
    throw new ApiError(404, 'Menu item not found.');
  }
  let category = req.body.categoryId ? await MenuCategory.findByPk(req.body.categoryId) : null;
  if (!category) {
    category = await MenuCategory.create({ id: `cat-${crypto.randomUUID()}`, restaurantId: req.body.restaurantId, name: req.body.categoryName });
  }
  await item.update({
    categoryId: category.id,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    image: req.body.image,
    available: req.body.available !== false,
    prepTime: req.body.prepTime,
    modifiers: req.body.modifiers || [],
  });
  await workflow.createActivity(req, { domain: 'menu', action: 'menu.item_updated', title: 'Updated menu item ' + item.name, description: 'A menu item was updated.', restaurantId: category.restaurantId, metadata: { categoryId: category.id, itemId: item.id, itemName: item.name, price: Number(item.price), available: Boolean(item.available) } });
  return ok(res, serializeMenuItem(item));
}

async function deleteItem(req, res) {
  const item = await MenuItem.findByPk(req.params.id);
  if (!item) {
    throw new ApiError(404, 'Menu item not found.');
  }
  await workflow.createActivity(req, { domain: 'menu', action: 'menu.item_deleted', title: 'Deleted menu item ' + item.name, description: 'A menu item was deleted.', metadata: { itemId: item.id, itemName: item.name } });
  await item.destroy();
  return noContent(res);
}

async function toggleAvailability(req, res) {
  const item = await MenuItem.findByPk(req.params.id);
  if (!item) {
    throw new ApiError(404, 'Menu item not found.');
  }
  await item.update({ available: !item.available });
  await workflow.createActivity(req, { domain: 'menu', action: 'menu.item_availability_toggled', title: (item.available ? 'Activated ' : 'Paused ') + item.name, description: 'Menu item availability was updated.', metadata: { itemId: item.id, itemName: item.name, available: Boolean(item.available) } });
  return ok(res, serializeMenuItem(item));
}

module.exports = {
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  listCategories,
  listProducts,
  toggleAvailability,
  updateCategory,
  updateItem,
};
