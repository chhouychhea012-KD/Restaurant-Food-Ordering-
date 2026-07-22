const router = require('express').Router();
const controller = require('../controllers/activity-log.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/http');

router.use(authenticate);
router.get('/', authorize(['activity_logs.read']), asyncHandler(controller.list));
router.post('/', authorize(['activity_logs.read']), asyncHandler(controller.create));

module.exports = router;
