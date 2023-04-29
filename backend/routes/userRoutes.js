const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Update user
router.patch('/:userID', userController.updateUser);

// Delete user
router.delete('/:userID', userController.deleteUser);

// Get a user
router.get('/:userID', userController.getUser);

// Follow/Unfollow a user
router.patch('/:userID/follow', userController.followUser);

module.exports = router;
