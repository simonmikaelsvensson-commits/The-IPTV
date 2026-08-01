const db = require('../db');

async function getAllUsers() {
  const res = await db.query('SELECT id, username, email, role, created_at FROM users ORDER BY id');
  return res.rows;
}

async function getUserById(id) {
  const res = await db.query('SELECT id, username, email, role, created_at FROM users WHERE id = $1', [id]);
  return res.rows[0];
}

async function getUserByEmail(email) {
  const res = await db.query('SELECT id, username, email, role, password_hash, created_at FROM users WHERE email = $1', [email]);
  return res.rows[0];
}

async function createUser({ username, email, password_hash, role = 'user' }) {
  const res = await db.query(
    `INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at`,
    [username, email, password_hash, role]
  );
  return res.rows[0];
}

module.exports = { getAllUsers, getUserById, getUserByEmail, createUser };
