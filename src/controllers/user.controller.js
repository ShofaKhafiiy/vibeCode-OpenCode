const bcrypt = require('bcryptjs');
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

async function getProfile(req, res, next) {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    if (!name && !email && !newPassword) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required' });
      }
      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
      }
    }

    if (email && email !== user.email) {
      const existing = await userModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    const fields = {};
    if (name) fields.name = name;
    if (email) fields.email = email;
    if (newPassword) fields.password = await bcrypt.hash(newPassword, 10);

    await userModel.update(req.user.id, fields);
    const updated = await userModel.findById(req.user.id);
    res.json({ data: { id: updated.id, name: updated.name, email: updated.email, role: updated.role } });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (Number(req.params.id) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this account' });
    }

    await userModel.remove(req.params.id);
    res.json({ data: { message: 'User deleted' } });
  } catch (err) {
    next(err);
  }
}

async function removeOwnAccount(req, res, next) {
  try {
    await userModel.remove(req.user.id);
    res.json({ data: { message: 'Account deleted' } });
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

async function adminGetAllUsers(req, res, next) {
  try {
    const users = await userModel.findAll();
    const total = await userModel.count();
    res.json({ data: { users, total } });
  } catch (err) {
    next(err);
  }
}

async function adminGetUserById(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

async function adminDeleteUser(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await userModel.remove(req.params.id);
    res.json({ data: { message: 'User deleted by admin' } });
  } catch (err) {
    next(err);
  }
}

async function adminUpdateUser(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { name, email, role } = req.body;
    const fields = {};
    if (name !== undefined) fields.name = name;
    if (email !== undefined) fields.email = email;
    if (role !== undefined) fields.role = role;

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    if (email && email !== user.email) {
      const existing = await userModel.findByEmail(email);
      if (existing) return res.status(409).json({ error: 'Email already in use' });
    }

    await userModel.update(req.params.id, fields);
    const updated = await userModel.findById(req.params.id);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll, getById, getProfile, updateProfile,
  remove, removeOwnAccount, removeByEmail,
  adminGetAllUsers, adminGetUserById, adminDeleteUser, adminUpdateUser,
};
