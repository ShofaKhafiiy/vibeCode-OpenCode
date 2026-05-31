const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query('SELECT id, name, email FROM users');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

async function create({ name, email, password, role }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role || 'user']
  );
  return { id: result.insertId, name, email, role: role || 'user' };
}

async function update(id, fields) {
  const setClauses = [];
  const values = [];

  if (fields.name !== undefined) {
    setClauses.push('name = ?');
    values.push(fields.name);
  }
  if (fields.email !== undefined) {
    setClauses.push('email = ?');
    values.push(fields.email);
  }
  if (fields.password !== undefined) {
    setClauses.push('password = ?');
    values.push(fields.password);
  }
  if (fields.role !== undefined) {
    setClauses.push('role = ?');
    values.push(fields.role);
  }

  if (setClauses.length === 0) return null;

  values.push(id);
  const [result] = await pool.query(
    `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`,
    values
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function removeByEmail(email) {
  const [result] = await pool.query('DELETE FROM users WHERE email = ?', [email]);
  return result.affectedRows > 0;
}

async function count() {
  const [rows] = await pool.query('SELECT COUNT(*) as total FROM users');
  return rows[0].total;
}

module.exports = { findAll, findById, findByEmail, create, update, remove, removeByEmail, count };
