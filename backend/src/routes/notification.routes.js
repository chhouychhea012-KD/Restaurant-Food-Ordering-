const router = require('express').Router();
const controller = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/http');

router.use(authenticate);
router.get('/', asyncHandler(controller.list));
router.post('/', asyncHandler(controller.create));
router.patch('/:id/read', asyncHandler(controller.markRead));
router.patch('/read-all', asyncHandler(controller.markAllRead));
router.delete('/:id', asyncHandler(controller.remove));

module.exports = router;
