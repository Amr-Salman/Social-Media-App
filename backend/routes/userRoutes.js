const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Update user
router.patch('/:userID', userController.updateUser);

// Delete user
router.delete('/:userID', userController.deleteUser);

// Get a user
router.get('/:userID', userController.getUser);

// Follow a user
router.patch('/:userID/follow', userController.followUser);

// Unfollow a user
router.patch('/:userID/unfollow', userController.unfollowUser);

module.exports = router;
