const express = require('express');
const postController = require('../controllers/postController');

// Initialize the router
const router = express.Router();

// Get timeline posts
router.get('/timeline/:userID', postController.getTimelinePosts);

// Get user posts
router.get('/user/:userID', postController.getUserPosts);

// Get a post
router.get('/:postID', postController.getPost);

// Create a post
router.post('/', postController.createPost);

// Update a post
router.patch('/:postID', postController.updatePost);

// Delete a post
router.delete('/:postID', postController.deletePost);

// Like/Dislike a post
router.post('/:postID/like', postController.likePost);

module.exports = router;
