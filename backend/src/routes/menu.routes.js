const router = require('express').Router();
const controller = require('../controllers/menu.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/http');

router.get('/products', authenticate, authorize(['menus.read']), asyncHandler(controller.listProducts));
router.get('/categories', authenticate, authorize(['menus.read']), asyncHandler(controller.listCategories));
router.post('/categories', authenticate, authorize(['menus.manage']), asyncHandler(controller.createCategory));
router.put('/categories/:id', authenticate, authorize(['menus.manage']), asyncHandler(controller.updateCategory));
router.delete('/categories/:id', authenticate, authorize(['menus.manage']), asyncHandler(controller.deleteCategory));
router.post('/items', authenticate, authorize(['menus.manage']), asyncHandler(controller.createItem));
router.put('/items/:id', authenticate, authorize(['menus.manage']), asyncHandler(controller.updateItem));
router.patch('/items/:id/availability', authenticate, authorize(['menus.availability.update']), asyncHandler(controller.toggleAvailability));
router.delete('/items/:id', authenticate, authorize(['menus.manage']), asyncHandler(controller.deleteItem));

module.exports = router;
