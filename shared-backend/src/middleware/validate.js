const { validationResult, check } = require('express-validator');
const { ErrorResponse } = require('./error');

// Middleware to validate request
exports.validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => err.msg);
    return next(new ErrorResponse(extractedErrors, 400));
  };
};

// Common validation rules
exports.commonValidations = {
  // MongoDB ObjectId validation
  id: check('id')
    .isMongoId()
    .withMessage('Invalid ID format'),

  // Pagination validation
  pagination: [
    check('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    check('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],

  // Search validation
  search: check('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query must not be empty'),

  // Sort validation
  sort: check('sort')
    .optional()
    .isString()
    .matches(/^[a-zA-Z]+(:[1,-1])?$/)
    .withMessage('Invalid sort format'),

  // Date range validation
  dateRange: [
    check('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    check('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date')
      .custom((endDate, { req }) => {
        if (req.query.startDate && endDate <= req.query.startDate) {
          throw new Error('End date must be after start date');
        }
        return true;
      })
  ],

  // Status validation
  status: check('status')
    .optional()
    .isIn(['active', 'inactive', 'pending', 'completed', 'cancelled'])
    .withMessage('Invalid status'),

  // Email validation
  email: check('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),

  // Password validation
  password: check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')
};

// Helper function to apply pagination
exports.paginate = (query, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;
  return {
    query: query.skip(skip).limit(limit),
    skip,
    limit: parseInt(limit)
  };
};

// Helper function to apply sorting
exports.sort = (query, sortStr) => {
  if (!sortStr) return query;

  const [field, order] = sortStr.split(':');
  const sortOrder = order === 'desc' ? -1 : 1;
  return query.sort({ [field]: sortOrder });
}; 