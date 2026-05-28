const { Router } = require('express');
const controller = require('../controllers/user.controller');

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);

module.exports = router;
