const todoModel = require('../models/todo.model');

async function getAll(req, res, next) {
  try {
    const todos = await todoModel.findByUserId(req.user.id);
    res.json({ data: todos });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const todo = await todoModel.create({ user_id: req.user.id, text: text.trim() });
    res.status(201).json({ data: todo });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const todo = await todoModel.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    if (todo.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this todo' });
    }

    const { text, completed } = req.body;
    const updated = await todoModel.update(req.params.id, { text, completed });
    if (!updated) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    const updatedTodo = await todoModel.findById(req.params.id);
    res.json({ data: updatedTodo });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const todo = await todoModel.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    if (todo.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this todo' });
    }

    await todoModel.remove(req.params.id);
    res.json({ data: { message: 'Todo deleted' } });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, update, remove };
