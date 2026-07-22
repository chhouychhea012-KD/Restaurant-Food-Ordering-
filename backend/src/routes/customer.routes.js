const router = require('express').Router();
const controller = require('../controllers/customer.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/http');

router.use(authenticate);
router.put('/:userId/profile', authorize(['profile.manage']), asyncHandler(controller.updateProfile));
router.patch('/:userId/loyalty', authorize(['loyalty.manage']), asyncHandler(controller.applyLoyalty));
router.delete('/:userId', authorize(['profile.manage']), asyncHandler(controller.deleteAccount));
router.get('/:userId/addresses', authorize(['orders.create']), asyncHandler(controller.listAddresses));
router.post('/:userId/addresses', authorize(['orders.create']), asyncHandler(controller.addAddress));
router.put('/:userId/addresses/:addressId', authorize(['orders.create']), asyncHandler(controller.updateAddress));
router.delete('/:userId/addresses/:addressId', authorize(['orders.create']), asyncHandler(controller.deleteAddress));

module.exports = router;
