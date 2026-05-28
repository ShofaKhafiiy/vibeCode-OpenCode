const pool = require('../config/db');

async function findByUserId(userId) {
  const [rows] = await pool.query(
    'SELECT id, text, completed, created_at FROM todos WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM todos WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create({ user_id, text }) {
  const [result] = await pool.query(
    'INSERT INTO todos (user_id, text) VALUES (?, ?)',
    [user_id, text]
  );
  return { id: result.insertId, user_id, text, completed: false };
}

async function update(id, { text, completed }) {
  const fields = [];
  const values = [];

  if (text !== undefined) {
    fields.push('text = ?');
    values.push(text);
  }
  if (completed !== undefined) {
    fields.push('completed = ?');
    values.push(completed);
  }

  if (fields.length === 0) return null;

  values.push(id);
  const [result] = await pool.query(
    `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM todos WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findByUserId, findById, create, update, remove };
