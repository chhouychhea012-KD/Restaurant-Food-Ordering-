const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/http');

router.post('/login', asyncHandler(controller.login));
router.post('/register', asyncHandler(controller.register));
router.get('/me', authenticate, asyncHandler(controller.me));

module.exports = router;
