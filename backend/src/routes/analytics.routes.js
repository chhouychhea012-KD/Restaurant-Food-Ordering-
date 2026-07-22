const router = require('express').Router();
const controller = require('../controllers/analytics.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/http');

router.get('/snapshot', authenticate, authorize(['analytics.read']), asyncHandler(controller.snapshot));

module.exports = router;
