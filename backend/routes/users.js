const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usersController');

// GET /users - list users
router.get('/', ctrl.listUsers);

// GET /users/:id - get user by id
router.get('/:id', ctrl.getUser);

module.exports = router;
