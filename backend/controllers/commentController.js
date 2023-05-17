const Comment = require('../models/commentModel');
const Post = require('../models/postModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const { isMongoID } = require('../utils/validation');

// @Desc    Create a comment
// @Route   POST api/comments/:postID
// @Access  Private
const createComment = asyncHandler(async (req, res) => {
  const { postID } = req.params;

  // Check if the ID is valid Mongo ID
  if (!isMongoID(postID)) {
    res.status(404);
    throw new Error('Post not found.');
  }

  // Get the post
  const post = await Post.findById(postID);

  // Check if post exists
  if (!post) {
    res.status(404);
    throw new Error('Post not found.');
  }

  try {
    const comment = (
      await comment.create({ ...req.body, user: req.user._id, post: postID })
    ).populate('user', 'username email _id profilePicture');
    res.status(201).json({
      message: 'Comment created successfully.',
      payload: await comment,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// @Desc    Delete a comment
// @Route   DELETE api/comments/:postID/:commentID
// @Access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const { postID, commentID } = req.params;

  // Check if the ID is valid Mongo ID
  if (!isMongoID(postID)) {
    res.status(404);
    throw new Error('Post not found.');
  }
  if (!isMongoID(commentID)) {
    res.status(404);
    throw new Error('Comment not found.');
  }

  // Get the Post
  const post = await Post.findById(postID);
  const comment = await comment.findById(postID);

  // Check if post and comment exists and the user is the post user
  if (!post) {
    res.status(404);
    throw new Error('Post not found.');
  }
  if (!comment || comment._id.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Comment not found.');
  }

  // Delete the post
  try {
    const comment = await Comment.findByIdAndDelete(commentID);
    res
      .status(201)
      .json({ message: 'Comment deleted successfully.', payload: comment });
  } catch (error) {
    res.status(500);
    throw new Error(err.message);
  }
});

module.exports = {
  createComment,
  deleteComment,
};
