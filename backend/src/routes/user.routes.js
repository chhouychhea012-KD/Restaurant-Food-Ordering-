const router = require('express').Router();
const controller = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../utils/http');

router.use(authenticate);
router.get('/', authorize(['users.manage']), asyncHandler(controller.list));
router.get('/:id', authorize(['users.manage']), asyncHandler(controller.show));
router.post('/', authorize(['users.manage']), asyncHandler(controller.create));
router.put('/:id', authorize(['users.manage']), asyncHandler(controller.update));
router.delete('/:id', authorize(['users.manage']), asyncHandler(controller.remove));

module.exports = router;
