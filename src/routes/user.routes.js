const { Router } = require('express');
const authenticate = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const controller = require('../controllers/user.controller');

const router = Router();

router.get('/', controller.getAll);
router.get('/profile', authenticate, controller.getProfile);
router.put('/profile', authenticate, controller.updateProfile);
router.delete('/profile', authenticate, controller.removeOwnAccount);
router.get('/:id', controller.getById);
router.delete('/email', authenticate, controller.removeByEmail);
router.delete('/:id', authenticate, controller.remove);

router.get('/admin/users', authenticate, adminOnly, controller.adminGetAllUsers);
router.get('/admin/users/:id', authenticate, adminOnly, controller.adminGetUserById);
router.put('/admin/users/:id', authenticate, adminOnly, controller.adminUpdateUser);
router.delete('/admin/users/:id', authenticate, adminOnly, controller.adminDeleteUser);

module.exports = router;
