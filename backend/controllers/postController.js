const Post = require('../models/postModel');
const Comment = require('../models/commentModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const { isMongoID } = require('../utils/validation');

// @Desc    Create a post
// @Route   POST api/post/
// @Access  Private
const createPost = asyncHandler(async (req, res) => {
  try {
    const newPost = (
      await Post.create({ ...req.body, user: req.user._id })
    ).populate('user', 'username email _id profilePicture');
    res.status(201).json({
      message: 'Post created successfully.',
      payload: await newPost,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// @Desc    Update a post
// @Route   PATCH api/post/:postID
// @Access  Private
const updatePost = asyncHandler(async (req, res) => {
  const { postID } = req.params;

  // Check if the ID is valid Mongo ID
  if (!isMongoID(postID)) {
    res.status(404);
    throw new Error('Post not found.');
  }

  // Get the Post
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

  // Check if the ID is valid Mongo ID
  if (!isMongoID(postID)) {
    res.status(404);
    throw new Error('Post not found.');
  }

  // Get the Post
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

  // Check if the ID is valid Mongo ID
  if (!isMongoID(postID)) {
    res.status(404);
    throw new Error('Post not found.');
  }

  // Get the post
  const post = await Post.findById(postID).populate(
    'user',
    'username email _id profilePicture'
  );

  // Check if post exists
  if (!post) {
    res.status(404);
    throw new Error('Post not found.');
  }

  // Get the comments
  const comments = await Comment.find({ post: postID }).populate(
    'user',
    'username email _id profilePicture'
  );
  res.status(201).json({
    message: 'Post got successfully.',
    payload: { ...post._doc, comments: comments },
  });
});

// @Desc    Get timeline posts
// @Route   GET api/post/timeline/all
// @Access  Private
const getTimelinePosts = asyncHandler(async (req, res) => {
  try {
    const userPosts = await Post.find({
      user: req.user._id.toString(),
    }).populate('user', 'username email _id profilePicture');
    // Get all the user's following posts
    const followingPosts = await Promise.all(
      req.user.followings.map((friend) => {
        return Post.find({ user: friend }).populate(
          'user',
          'username email _id profilePicture'
        );
      })
    );
    res.status(201).json({
      message: 'Timeline got successfully.',
      payload: userPosts
        .concat(...followingPosts)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
  } catch (error) {
    res.status(500);
    throw new Error(err.message);
  }
});

// @Desc    Get all user posts
// @Route   GET api/post/user/:id
// @Access  Private
const getUserPosts = asyncHandler(async (req, res) => {
  const { userID } = req.params;

  // Check if the ID is valid Mongo ID
  if (!isMongoID(userID)) {
    res.status(404);
    throw new Error('User not found.');
  }
  // Get the user to check if exist
  const user = await User.findById(userID);

  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  try {
    const userPosts = await Post.find({
      user: userID,
    })
      .populate('user', 'username email _id profilePicture')
      .sort({ createdAt: -1 });

    res.status(201).json({
      message: 'Timeline got successfully.',
      payload: userPosts,
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

  // Check if the ID is valid Mongo ID
  if (!isMongoID(postID)) {
    res.status(404);
    throw new Error('Post not found.');
  }

  // Get the Post
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

// @Desc    Create a comment
// @Route   POST api/post/:postID/comment
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
    const comment = await Comment.create({
      text: req.body.text,
      user: req.user._id,
      post: postID,
    });
    res.status(201).json({
      message: 'Comment created successfully.',
      payload: await comment.populate(
        'user',
        'username email _id profilePicture'
      ),
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// @Desc    Delete a comment
// @Route   DELETE api/posts/:postID/:commentID
// @Access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const { postID, commentID } = req.params;
  console.log('postID', postID);
  console.log('commentID', commentID);
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
  const comment = await Comment.findById(commentID);
  console.log(comment);

  // Check if post and comment exists and the user is the post user
  if (!post) {
    res.status(404);
    throw new Error('Post not found.');
  }
  if (!comment || comment.user.toString() !== req.user._id.toString()) {
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
  createPost,
  deletePost,
  updatePost,
  getPost,
  getTimelinePosts,
  getUserPosts,
  likePost,
  createComment,
  deleteComment,
};
