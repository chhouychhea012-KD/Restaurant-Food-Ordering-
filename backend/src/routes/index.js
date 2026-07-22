const router = require('express').Router();

router.get('/health', (_req, res) => res.json({ data: { status: 'ok', service: 'flavor-fleet-api' } }));
router.use('/auth', require('./auth.routes'));
router.use('/roles', require('./role.routes'));
router.use('/users', require('./user.routes'));
router.use('/restaurants', require('./restaurant.routes'));
router.use('/menus', require('./menu.routes'));
router.use('/orders', require('./order.routes'));
router.use('/customers', require('./customer.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/activity-logs', require('./activity-log.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/riders', require('./rider.routes'));

module.exports = router;
