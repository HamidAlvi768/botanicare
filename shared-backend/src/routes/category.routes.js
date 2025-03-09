const express = require('express');
const { check } = require('express-validator');
const { validate, commonValidations } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const fileUpload = require('../utils/fileUpload');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree
} = require('../controllers/category.controller');

const router = express.Router();

// Validation rules
const categoryValidation = [
  check('name', 'Name is required').notEmpty(),
  check('description', 'Description is required').notEmpty(),
  check('parentCategory', 'Parent category ID must be valid')
    .optional()
    .isMongoId(),
  check('status', 'Invalid status')
    .optional()
    .isIn(['Active', 'Inactive']),
  check('featured', 'Featured must be a boolean')
    .optional()
    .isBoolean()
];

// Public routes
router.get('/', validate([commonValidations.pagination, commonValidations.search]), getCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', validate([commonValidations.id]), getCategory);

// Protected routes
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .post(
    fileUpload.upload.single('image'),
    validate(categoryValidation),
    createCategory
  );

router
  .route('/:id')
  .put(
    fileUpload.upload.single('image'),
    validate([...categoryValidation, commonValidations.id]),
    updateCategory
  )
  .delete(
    validate([commonValidations.id]),
    deleteCategory
  );

module.exports = router; 