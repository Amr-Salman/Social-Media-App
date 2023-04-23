const express = require('express');
const authController = require('../controllers/authController');

// Initialize the router
const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
