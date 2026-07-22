const router = require('express').Router();
const controller = require('../controllers/role.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/http');

router.use(authenticate);
router.get('/', authorize(['roles.read']), asyncHandler(controller.list));
router.get('/permissions', authorize(['roles.read']), asyncHandler(controller.permissions));
router.post('/', authorize(['roles.create']), asyncHandler(controller.create));
router.put('/:id', authorize(['roles.update']), asyncHandler(controller.update));
router.delete('/:id', authorize(['roles.delete']), asyncHandler(controller.remove));

module.exports = router;
