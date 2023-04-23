const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

const protectRoutes = asyncHandler(async (req, res, next) => {
  let token;
  // Check if token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      // Verified the token and get the user
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userID).select('-password');
      req.user = user;
      next();
    } catch (error) {
      throw new Error('Invalid Token');
    }
  } else {
    throw new Error('No token');
  }
});

module.exports = protectRoutes;
