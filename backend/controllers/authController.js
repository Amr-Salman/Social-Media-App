const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { authValidation } = require('../utils/validation');

// @Desc    Register a user
// @route   POST api/auth/register
// @Access  Public
const register = asyncHandler(async (req, res) => {
  // Validate fields
  const { isError, errors } = authValidation.register(req.body);
  if (isError) {
    res.status(400);
    throw new Error(errors);
  }

  const { username, email, password } = req.body;
  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists!');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    // Delete the password before send the user
    delete user._doc.password;
    res.status(201).json({
      message: 'User registered successfully',
      payload: { ...user._doc, token: generateToken(user._id) },
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// @Desc    Login a user
// @route   POST api/auth/login
// @Access  Public
const login = asyncHandler(async (req, res) => {
  // Validate fields
  const { isError, errors } = authValidation.login(req.body);
  if (isError) {
    res.status(400);
    throw new Error(errors);
  }
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Delete the password before send the user
      delete user._doc.password;
      res.status(201).json({
        message: 'User logged in successfully',
        payload: { ...user._doc, token: generateToken(user._id) },
      });
    } else {
      res.status(400);
      throw new Error('Invalid credintails');
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const generateToken = (userID) => {
  return jwt.sign({ userID: userID }, process.env.JWT_SECRET);
};
module.exports = {
  register,
  login,
};
