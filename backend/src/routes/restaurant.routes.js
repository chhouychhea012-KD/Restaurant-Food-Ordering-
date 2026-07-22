const router = require('express').Router();
const controller = require('../controllers/restaurant.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/http');

router.get('/', asyncHandler(controller.list));
router.get('/:idOrSlug', asyncHandler(controller.show));
router.post('/', authenticate, authorize(['restaurants.create']), asyncHandler(controller.create));
router.put('/:id', authenticate, authorize(['restaurants.update']), asyncHandler(controller.update));
router.patch('/:id/verification', authenticate, authorize(['restaurants.update']), asyncHandler(controller.setVerification));
router.patch('/:id/partner-status', authenticate, authorize(['restaurants.suspend']), asyncHandler(controller.setPartnerStatus));
router.delete('/:id', authenticate, authorize(['restaurants.delete']), asyncHandler(controller.remove));

module.exports = router;
