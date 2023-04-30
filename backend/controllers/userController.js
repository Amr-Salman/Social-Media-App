const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const Post = require('../models/postModel');
const { isMongoID } = require('../utils/validation');

// @Desc    Update a user
// @route   PUT api/users/:userID
// @Access  Private
const updateUser = asyncHandler(async (req, res) => {
  const { userID } = req.params;

  // Check if the ID is valid Mongo ID
  if (!isMongoID(userID)) {
    res.status(404);
    throw new Error('User not found.');
  }

  if (userID !== req.user._id.toString()) {
    res.status(400);
    throw new Error('You can only updated your account!!');
  }

  // Check if user is trying to update password
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }
  try {
    const user = await User.findByIdAndUpdate(userID, req.body);
    delete user._doc.password;
    res.status(200).json({
      message: 'Account has been updated successfully.',
      payload: { ...user._doc },
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// @Desc    Delete a user
// @route   DELETE api/users/:userID
// @Access  Private
const deleteUser = asyncHandler(async (req, res) => {
  const { userID } = req.params;

  // Check if the ID is valid Mongo ID
  if (!isMongoID(userID)) {
    res.status(404);
    throw new Error('User not found.');
  }

  if (userID !== req.user._id.toString()) {
    res.status(400);
    throw new Error('You can only deleted your account!!');
  }
  try {
    const user = await User.findByIdAndDelete(userID);
    delete user._doc.password;
    res.status(200).json({
      message: 'Account has been deleted successfully.',
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// @Desc    Get a user
// @route   GET api/users/:userID
// @Access  Private
const getUser = asyncHandler(async (req, res) => {
  const { userID } = req.params;

  // Check if the ID is valid Mongo ID
  if (!isMongoID(userID)) {
    res.status(404);
    throw new Error('User not found.');
  }

  try {
    const user = await User.findById(userID).select(
      '-password -isAdmin -updatedAt'
    );
    if (!user) {
      res.status(404);
      throw new Error('User not found.');
    }
    const userPosts = await Post.find({ user: userID }).populate(
      'user',
      'username email _id profilePicture'
    );
    res.status(200).json({
      message: '',
      payload: { ...user._doc, posts: userPosts },
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// @Desc    Follow a user
// @route   PATCH api/users/:userID/follow
// @Access  Private
const followUser = asyncHandler(async (req, res) => {
  const { userID } = req.params;

  // Check if the ID is valid Mongo ID
  if (!isMongoID(userID)) {
    res.status(404);
    throw new Error('User not found.');
  }

  if (userID === req.user._id.toString()) {
    res.status(400);
    throw new Error('You can not follow yourself!!');
  }
  try {
    const user = await User.findById(userID).select(
      '-password -isAdmin -updatedAt'
    );
    // Check if user exists
    if (!user) {
      res.status(404);
      throw new Error('User not found.');
    }
    // Check if the current user not already following the user
    if (!req.user.followings.includes(userID)) {
      // Update the current user
      const currentUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { followings: userID },
        },
        { new: true }
      ).select('-password');
      // Update the user that has been followed
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $push: { followers: req.user._id.toString() } },
        { new: true }
      ).select('-password -createdAt -isAdmin -updatedAt');

      res.status(200).json({
        message: `You follow ${user.username}`,
        payload: updatedUser,
      });
    } else {
      // Update the current user
      const currentUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { followings: userID },
        },
        { new: true }
      ).select('-password');
      // Update the user that has been unfollowed
      const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { $pull: { followers: req.user._id.toString() } },
        { new: true }
      ).select('-password -createdAt -isAdmin -updatedAt');

      res.status(200).json({
        message: `You unfollowed ${user.username}`,
        payload: updatedUser,
      });
    }
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

module.exports = {
  updateUser,
  deleteUser,
  getUser,
  followUser,
};
