const userModel = require('../models/user.model');

async function getAll(req, res, next) {
  try {
    const users = await userModel.findAll();
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (Number(req.params.id) !== req.user.id) {
      return res.status(403).json({ error: 'Can only delete your own account' });
    }

    await userModel.remove(req.params.id);
    res.json({ data: { message: 'User deleted' } });
  } catch (err) {
    next(err);
  }
}

async function removeByEmail(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });

    const user = await userModel.findByEmail(email);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await userModel.removeByEmail(email);
    res.json({ data: { message: 'User deleted' } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, remove, removeByEmail };
