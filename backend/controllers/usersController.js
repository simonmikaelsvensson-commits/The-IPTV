const User = require('../models/user');
const logger = require('../utils/logger');

async function listUsers(req, res) {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (err) {
    logger.error('listUsers error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUser(req, res) {
  const id = req.params.id;
  try {
    const user = await User.getUserById(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    logger.error('getUser error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { listUsers, getUser };
