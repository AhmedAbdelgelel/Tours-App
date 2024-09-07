const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};
exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        user: newUser
      }
    });
    exports.updateUser = async (req, res) => {
      try {
        const { password, passwordConfirm, ...updateFields } = req.body;

        if (password) {
          if (password !== passwordConfirm) {
            return res.status(400).json({
              status: 'fail',
              message: 'Passwords do not match'
            });
          }

          // Hash the new password
          updateFields.password = await bcrypt.hash(password, 12);
        }

        // Update user details
        const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
          new: true,
          runValidators: true
        });

        if (!user) {
          return res.status(404).json({
            status: 'fail',
            message: 'No user found with that ID'
          });
        }

        // Remove sensitive field from response
        user.passwordConfirm = undefined;

        res.status(200).json({
          status: 'success',
          data: { user }
        });
      } catch (error) {
        res.status(400).json({
          status: 'fail',
          message: error.message
        });
      }
    };
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};
exports.updateUser = async (req, res) => {
  try {
    const { password, passwordConfirm, ...updateFields } = req.body;

    if (password) {
      if (password !== passwordConfirm) {
        return res.status(400).json({
          status: 'fail',
          message: 'Passwords do not match'
        });
      }

      // Hash the new password
      updateFields.password = await bcrypt.hash(password, 12);
    }

    // Update user details
    const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true
    });
    user.passwordConfirm = undefined;

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }
  // 2) Update user document
  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  // 3) Send the updated user back
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});
// Delete user information
exports.deleteMe = catchAsync(async (req, res, next) => {
  // 1) Delete user from collection
  await User.findByIdAndUpdate(req.user.id, { active: false });
  // 2) Send response
  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
