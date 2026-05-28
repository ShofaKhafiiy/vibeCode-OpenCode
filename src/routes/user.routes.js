const { Router } = require('express');
const authenticate = require('../middleware/auth');
const controller = require('../controllers/user.controller');

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.delete('/email', authenticate, controller.removeByEmail);
router.delete('/:id', authenticate, controller.remove);

module.exports = router;
