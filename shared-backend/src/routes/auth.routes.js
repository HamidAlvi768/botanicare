const express = require('express');
const { check } = require('express-validator');
const { validate } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail
} = require('../controllers/auth.controller');

const router = express.Router();

// Validation rules
const registerValidation = [
  check('firstName', 'First name is required').notEmpty(),
  check('lastName', 'Last name is required').notEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with 8 or more characters')
    .isLength({ min: 8 })
];

const loginValidation = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
];

const passwordValidation = [
  check('password', 'Please enter a password with 8 or more characters')
    .isLength({ min: 8 })
];

// Routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.get('/me', protect, getMe);
router.post('/forgot-password', 
  [check('email', 'Please include a valid email').isEmail()],
  validate([]),
  forgotPassword
);
router.put('/reset-password/:token', validate(passwordValidation), resetPassword);
router.put('/update-password',
  protect,
  validate([
    check('currentPassword', 'Current password is required').exists(),
    ...passwordValidation
  ]),
  updatePassword
);
router.get('/verify-email/:token', verifyEmail);

module.exports = router; 