const { Router } = require('express');
const authenticate = require('../middleware/auth');
const controller = require('../controllers/todo.controller');

const router = Router();

router.use(authenticate);

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
