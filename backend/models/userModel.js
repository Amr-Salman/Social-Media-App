const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      maxLength: 50,
    },
    password: {
      type: String,
      minLength: [6, 'Passwords should be at least 6 characters.'],
    },
    profilePicture: {
      type: String,
      default: '',
    },
    coverPicture: {
      type: String,
      default: '',
    },
    followers: {
      type: Array,
      default: [],
    },
    followings: {
      type: Array,
      default: [],
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,
      maxLength: 200,
      default: '',
    },
    city: {
      type: String,
      default: '',
      maxLength: 50,
    },
    from: {
      type: String,
      default: '',
      maxLength: 50,
    },
    relationship: {
      type: String,
      default: '',
      maxLength: 50,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
