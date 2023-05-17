const validator = require('validator');

const authValidation = {
  register: (userData) => {
    let isError;
    let errors = [];

    // Check all the fields
    if (!userData.name && !userData.email && !userData.password) {
      isError = true;
      errors.push('Please fill all the fields.');
      return { isError, errors };
    }

    // Validate name field
    if (!validator.isLength(userData.username, { min: 3, max: 30 })) {
      isError = true;
      errors.push('Name should be between 3-30 characters.');
    }

    // Validate email field
    if (!validator.isEmail(userData.email)) {
      isError = true;
      errors.push('Please enter a valid email.');
    }
    // Validate password field
    if (!validator.isStrongPassword(userData.password, { minSymbols: 0 })) {
      isError = true;
      errors.push(
        'Password should be 8 characters long, contains at least 1 uppercase, 1 lowercase, 1 number.'
      );
    }
    return { isError, errors };
  },

  login: (userData) => {
    let isError;
    let errors = [];

    // Check all the fields
    if (!userData.email && !userData.password) {
      isError = true;
      errors.push('Please fill all the fields.');
      return { isError, errors };
    }

    // Validate email field
    if (!validator.isEmail(userData.email)) {
      isError = true;
      errors.push('Please enter a valid email.');
    }
    // Validate password field
    if (!validator.isStrongPassword(userData.password, { minSymbols: 0 })) {
      isError = true;
      errors.push(
        'Password should be 8 characters long, contains at least 1 uppercase, 1 lowercase, 1 number.'
      );
    }
    return { isError, errors };
  },
};

const isMongoID = (ID) => {
  return validator.isMongoId(ID);
};
module.exports = {
  authValidation,
  isMongoID,
};
