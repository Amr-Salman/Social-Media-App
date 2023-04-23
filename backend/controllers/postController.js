const Post = require('../models/postModel');
const asyncHandler = require('express-async-handler');

// @Desc    Create a post
// @Route   POST api/post/
// @Access  Private
const createPost = asyncHandler(async (req, res) => {
  const { desc, img } = req.body;
  try {
    const newPost = await Post.create({ desc, img, user: req.user._id });
    res
      .status(201)
      .json({ message: 'Post created successfully.', payload: newPost });
  } catch (error) {
    res.status(500);
    throw new Error(err.message);
  }
});

// @Desc    Update a post
// @Route   PATCH api/post/:postID
// @Access  Private
const updatePost = asyncHandler(async (req, res) => {
  const { postID } = req.params;
  const post = await Post.findById(postID);

  // Check if post exists and the user is the post user
  if (!post || post.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Post not found.');
  }

  // Update the post
  try {
    const newPost = await Post.findByIdAndUpdate(postID, req.body, {
      new: true,
    });
    res
      .status(201)
      .json({ message: 'Post updated successfully.', payload: newPost });
  } catch (error) {
    res.status(500);
    throw new Error(err.message);
  }
});

// @Desc    Delete a post
// @Route   DELETE api/post/:postID
// @Access  Private
const deletePost = asyncHandler(async (req, res) => {
  const { postID } = req.params;
  const post = await Post.findById(postID);

  // Check if post exists and the user is the post user
  if (!post || post.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Post not found.');
  }

  // Delete the post
  try {
    const newPost = await Post.findByIdAndDelete(postID);
    res
      .status(201)
      .json({ message: 'Post deleted successfully.', payload: newPost });
  } catch (error) {
    res.status(500);
    throw new Error(err.message);
  }
});

// @Desc    Get a post
// @Route   GET api/post/:postID
// @Access  Private
const getPost = asyncHandler(async (req, res) => {
  const { postID } = req.params;
  const post = await Post.findById(postID);

  // Check if post exists
  if (!post) {
    res.status(404);
    throw new Error('Post not found.');
  }
  res.status(201).json({ message: 'Post got successfully.', payload: post });
});

// @Desc    Get timeline posts
// @Route   GET api/post/timeline/all
// @Access  Private
const getTimelinePosts = asyncHandler(async (req, res) => {
  try {
    const userPosts = await Post.find({ user: req.user._id.toString() });
    // Get all the user's following posts
    const followingPosts = await Promise.all(
      req.user.followings.map((friend) => {
        return Post.find({ user: friend });
      })
    );
    res.status(201).json({
      message: 'Timeline got successfully.',
      payload: userPosts.concat(...followingPosts),
    });
  } catch (error) {
    res.status(500);
    throw new Error(err.message);
  }
});

// @Desc    Like/Dislike a post
// @Route   POST api/post/:postID/like
// @Access  Private
const likePost = asyncHandler(async (req, res) => {
  const { postID } = req.params;
  const post = await Post.findById(postID);

  // Check if post exists
  if (!post) {
    res.status(404);
    throw new Error('Post not found.');
  }

  try {
    // Check if the user already liked the post or not
    if (!post.likes.includes(req.user._id.toString())) {
      // Like the post
      const likedPost = await Post.findByIdAndUpdate(
        postID,
        {
          $push: { likes: req.user._id },
        },
        { new: true }
      );
      res.status(201).json({
        message: `You liked '${likedPost.desc}'.`,
        payload: likedPost,
      });
    } else {
      // Dislike the post
      const likedPost = await Post.findByIdAndUpdate(
        postID,
        {
          $pull: { likes: req.user._id },
        },
        { new: true }
      );
      res.status(201).json({
        message: `You unliked '${likedPost.desc}'.`,
        payload: likedPost,
      });
    }
  } catch (error) {
    res.status(500);
    throw new Error(err.message);
  }
});

module.exports = {
  createPost,
  deletePost,
  updatePost,
  getPost,
  getTimelinePosts,
  likePost,
};