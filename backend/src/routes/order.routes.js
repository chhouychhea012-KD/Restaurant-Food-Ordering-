const router = require('express').Router();
const controller = require('../controllers/order.controller');
const { authenticate, authorize, authorizeAny } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/http');

router.use(authenticate);
router.get('/', authorizeAny(['orders.read', 'orders.create', 'dispatch.read']), asyncHandler(controller.list));
router.get('/:id', authorizeAny(['orders.read', 'orders.create', 'dispatch.read']), asyncHandler(controller.show));
router.post('/', authorize(['orders.create']), asyncHandler(controller.create));
router.put('/:id', authorizeAny(['orders.status.update', 'dispatch.read']), asyncHandler(controller.update));
router.patch('/:id/status', authorizeAny(['orders.status.update', 'dispatch.read']), asyncHandler(controller.updateStatus));
router.patch('/:id/refund', authorizeAny(['orders.refund.approve', 'orders.status.update']), asyncHandler(controller.approveRefund));
router.delete('/:id', authorizeAny(['orders.cancel', 'orders.status.update']), asyncHandler(controller.remove));

module.exports = router;
