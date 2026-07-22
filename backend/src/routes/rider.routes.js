const router = require('express').Router();
const controller = require('../controllers/rider.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/http');

router.use(authenticate);
router.get('/', authorize(['riders.read']), asyncHandler(controller.list));
router.patch('/:id/availability', authorize(['riders.status.update']), asyncHandler(controller.toggleAvailability));

module.exports = router;
