const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

// @Desc    Update a user
// @route   PUT api/users/:userID
// @Access  Private
const updateUser = asyncHandler(async (req, res) => {
  const { userID } = req.params;
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
  try {
    const user = await User.findById(userID).select(
      '-password -isAdmin -updatedAt'
    );
    if (!user) {
      res.status(404);
      throw new Error('User not found.');
    }
    res.status(200).json({
      message: '',
      payload: user,
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
      await user.updateOne({ $push: { followers: userID } });

      res.status(200).json({
        message: `You statred following ${user.username}`,
        payload: currentUser,
      });
    } else {
      res.status(400);
      throw new Error('You already following this user!');
    }
  } catch (error) {
    res.status(500);
    throw new Error(error.message);
  }
});

// @Desc    Follow a user
// @route   PATCH api/users/:userID/follow
// @Access  Private
const unfollowUser = asyncHandler(async (req, res) => {
  const { userID } = req.params;
  if (userID === req.user._id.toString()) {
    res.status(400);
    throw new Error('You can not unfollow yourself!!');
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
    // Check if the current user already following the user
    if (req.user.followings.includes(userID)) {
      // Update the current user
      const currentUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { followings: userID },
        },
        { new: true }
      ).select('-password');
      // Update the user that has been followed
      await user.updateOne({ $pull: { followers: userID } });

      res.status(200).json({
        message: `You unfollowed ${user.username}`,
        payload: currentUser,
      });
    } else {
      res.status(400);
      throw new Error('You already do not follow this user!');
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
  unfollowUser,
};
