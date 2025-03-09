const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error');
const asyncHandler = require('../middleware/async');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: await User.find()
  });
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Get user's wishlist
// @route   GET /api/v1/users/wishlist
// @access  Private
exports.getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist');

  res.status(200).json({
    success: true,
    data: user.wishlist
  });
});

// @desc    Add to wishlist
// @route   POST /api/v1/users/wishlist
// @access  Private
exports.addToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { wishlist: req.body.productId } },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: user.wishlist
  });
});

// @desc    Remove from wishlist
// @route   DELETE /api/v1/users/wishlist/:productId
// @access  Private
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $pull: { wishlist: req.params.productId } },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: user.wishlist
  });
});

// @desc    Get user notifications
// @route   GET /api/v1/users/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('notifications');

  res.status(200).json({
    success: true,
    data: user.notifications
  });
});

// @desc    Mark notification as read
// @route   PUT /api/v1/users/notifications/:id/read
// @access  Private
exports.markNotificationRead = asyncHandler(async (req, res) => {
  const user = await User.findOneAndUpdate(
    { 
      _id: req.user.id,
      'notifications._id': req.params.id
    },
    {
      $set: { 'notifications.$.read': true }
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: user.notifications
  });
});

// @desc    Clear all notifications
// @route   DELETE /api/v1/users/notifications
// @access  Private
exports.clearNotifications = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: { notifications: [] } },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: user.notifications
  });
}); 