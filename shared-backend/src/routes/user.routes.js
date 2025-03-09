const express = require('express');
const { check } = require('express-validator');
const { validate, commonValidations } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateProfile,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  getNotifications,
  markNotificationRead,
  clearNotifications
} = require('../controllers/user.controller');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Validation rules
const userValidation = [
  check('firstName', 'First name is required').notEmpty(),
  check('lastName', 'Last name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 8 or more characters')
    .optional()
    .isLength({ min: 8 }),
  check('role', 'Invalid role')
    .optional()
    .isIn(['customer', 'admin', 'super-admin']),
  check('status', 'Invalid status')
    .optional()
    .isIn(['Active', 'Inactive', 'Suspended'])
];

const profileValidation = [
  check('firstName', 'First name is required').optional().notEmpty(),
  check('lastName', 'Last name is required').optional().notEmpty(),
  check('phoneNumber', 'Invalid phone number').optional().isMobilePhone('any'),
  check('address.street', 'Street is required').optional().notEmpty(),
  check('address.city', 'City is required').optional().notEmpty(),
  check('address.state', 'State is required').optional().notEmpty(),
  check('address.postalCode', 'Postal code is required').optional().notEmpty(),
  check('address.country', 'Country is required').optional().notEmpty()
];

// Admin routes
router
  .route('/')
  .get(authorize('admin', 'super-admin'), getUsers)
  .post(
    authorize('admin', 'super-admin'),
    validate(userValidation),
    createUser
  );

router
  .route('/:id')
  .get(
    authorize('admin', 'super-admin'),
    validate([commonValidations.id]),
    getUser
  )
  .put(
    authorize('admin', 'super-admin'),
    validate([...userValidation, commonValidations.id]),
    updateUser
  )
  .delete(
    authorize('admin', 'super-admin'),
    validate([commonValidations.id]),
    deleteUser
  );

// Profile routes
router.put(
  '/profile',
  validate(profileValidation),
  updateProfile
);

// Wishlist routes
router
  .route('/wishlist')
  .get(getWishlist)
  .post(
    validate([check('productId', 'Product ID is required').isMongoId()]),
    addToWishlist
  );

router.delete(
  '/wishlist/:productId',
  validate([check('productId', 'Product ID is required').isMongoId()]),
  removeFromWishlist
);

// Notification routes
router
  .route('/notifications')
  .get(getNotifications)
  .delete(clearNotifications);

router.put(
  '/notifications/:id/read',
  validate([check('id', 'Notification ID is required').isMongoId()]),
  markNotificationRead
);

module.exports = router; 