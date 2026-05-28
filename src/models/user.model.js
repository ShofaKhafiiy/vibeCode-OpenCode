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

async function create({ name, email, password }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, password]
  );
  return { id: result.insertId, name, email };
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function removeByEmail(email) {
  const [result] = await pool.query('DELETE FROM users WHERE email = ?', [email]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByEmail, create, remove, removeByEmail };
