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

module.exports = { getAll, getById };
