const router = require('express').Router();
const controller = require('../controllers/voucher.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/http');

router.get('/available', asyncHandler(controller.available));
router.post('/validate', asyncHandler(controller.validate));
router.use(authenticate);
router.get('/', authorize(['promotions.read']), asyncHandler(controller.list));
router.get('/:id', authorize(['promotions.read']), asyncHandler(controller.show));
router.post('/promo-events', authorize(['promotions.manage']), asyncHandler(controller.createPromoEvent));
router.post('/', authorize(['promotions.manage']), asyncHandler(controller.create));
router.put('/:id', authorize(['promotions.manage']), asyncHandler(controller.update));
router.delete('/:id', authorize(['promotions.manage']), asyncHandler(controller.remove));

module.exports = router;
