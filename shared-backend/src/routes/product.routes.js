const express = require('express');
const { check } = require('express-validator');
const { validate, commonValidations } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const fileUpload = require('../utils/fileUpload');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductRating,
  updateProductRating,
  deleteProductRating
} = require('../controllers/product.controller');

const router = express.Router();

// Validation rules
const productValidation = [
  check('name', 'Name is required').notEmpty(),
  check('description', 'Description is required').notEmpty(),
  check('price', 'Price must be a positive number')
    .isFloat({ min: 0 }),
  check('category', 'Category ID is required').isMongoId(),
  check('stock', 'Stock must be a non-negative number')
    .optional()
    .isInt({ min: 0 }),
  check('features', 'Features must be an array')
    .optional()
    .isArray()
];

const ratingValidation = [
  check('rating', 'Rating must be between 1 and 5')
    .isInt({ min: 1, max: 5 }),
  check('review', 'Review is required').notEmpty()
];

// Public routes
router.get('/', validate([commonValidations.pagination, commonValidations.search]), getProducts);
router.get('/:id', validate([commonValidations.id]), getProduct);

// Protected routes
router.use(protect);

// Admin routes
router
  .route('/')
  .post(
    authorize('admin'),
    fileUpload.upload.array('images', 5),
    validate(productValidation),
    createProduct
  );

router
  .route('/:id')
  .put(
    authorize('admin'),
    fileUpload.upload.array('images', 5),
    validate([...productValidation, commonValidations.id]),
    updateProduct
  )
  .delete(
    authorize('admin'),
    validate([commonValidations.id]),
    deleteProduct
  );

// Rating routes
router
  .route('/:id/ratings')
  .post(
    validate([...ratingValidation, commonValidations.id]),
    addProductRating
  );

router
  .route('/:id/ratings/:ratingId')
  .put(
    validate([
      ...ratingValidation,
      commonValidations.id,
      check('ratingId', 'Rating ID is required').isMongoId()
    ]),
    updateProductRating
  )
  .delete(
    validate([
      commonValidations.id,
      check('ratingId', 'Rating ID is required').isMongoId()
    ]),
    deleteProductRating
  );

// Middleware to emit real-time updates
router.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    const io = req.app.get('io');
    
    // Emit updates for product changes
    if (data.success && data.data && req.method !== 'GET') {
      const product = data.data;
      io.to(`product-${product._id}`).emit('product-update', {
        type: req.method,
        data: product
      });

      // Emit inventory updates
      if (product.stock !== undefined) {
        io.emit('inventory-update', {
          productId: product._id,
          stock: product.stock,
          status: product.status
        });
      }
    }

    return originalJson.call(this, data);
  };
  next();
});

module.exports = router; 