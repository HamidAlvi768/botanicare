const express = require('express');
const { check } = require('express-validator');
const { validate, commonValidations } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  processRefund,
  getOrderStats
} = require('../controllers/order.controller');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Validation rules
const orderValidation = [
  check('items', 'Items are required')
    .isArray()
    .notEmpty(),
  check('items.*.product', 'Product ID is required for each item')
    .isMongoId(),
  check('items.*.quantity', 'Quantity must be a positive number for each item')
    .isInt({ min: 1 }),
  check('shippingAddress', 'Shipping address is required').notEmpty(),
  check('shippingAddress.firstName', 'First name is required').notEmpty(),
  check('shippingAddress.lastName', 'Last name is required').notEmpty(),
  check('shippingAddress.street', 'Street is required').notEmpty(),
  check('shippingAddress.city', 'City is required').notEmpty(),
  check('shippingAddress.state', 'State is required').notEmpty(),
  check('shippingAddress.postalCode', 'Postal code is required').notEmpty(),
  check('shippingAddress.country', 'Country is required').notEmpty(),
  check('shippingAddress.phoneNumber', 'Phone number is required').notEmpty(),
  check('paymentMethod', 'Payment method is required')
    .isIn(['credit_card', 'debit_card', 'paypal'])
];

const statusValidation = [
  check('status', 'Status is required')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  check('note', 'Status update note is required').notEmpty(),
  check('trackingNumber', 'Tracking number must be a string')
    .optional()
    .isString(),
  check('estimatedDeliveryDate', 'Invalid delivery date')
    .optional()
    .isISO8601()
];

const refundValidation = [
  check('amount', 'Refund amount must be a positive number')
    .optional()
    .isFloat({ min: 0 })
];

// Customer routes
router
  .route('/')
  .get(validate([commonValidations.pagination, commonValidations.search]), getOrders)
  .post(validate(orderValidation), createOrder);

router.get('/my-orders', validate([commonValidations.pagination]), (req, res, next) => {
  req.query.user = req.user.id;
  next();
}, getOrders);

router.get('/:id', validate([commonValidations.id]), getOrder);

// Admin routes
router.use(authorize('admin'));

router.get('/stats', getOrderStats);

router.put(
  '/:id/status',
  validate([commonValidations.id, ...statusValidation]),
  updateOrderStatus
);

router.post(
  '/:id/refund',
  validate([commonValidations.id, ...refundValidation]),
  processRefund
);

// Middleware to emit real-time updates
router.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    const io = req.app.get('io');
    
    // Emit updates for order changes
    if (data.success && data.data && req.method !== 'GET') {
      const order = data.data;
      
      // Emit to order room
      io.to(`order-${order._id}`).emit('order-update', {
        type: req.method,
        data: order
      });

      // Emit to user's room
      io.to(`user-${order.user}`).emit('order-update', {
        type: req.method,
        data: order
      });

      // Emit status updates
      if (order.orderStatus) {
        io.to(`order-${order._id}`).emit('status-update', {
          orderId: order._id,
          status: order.orderStatus,
          timestamp: new Date()
        });
      }
    }

    return originalJson.call(this, data);
  };
  next();
});

module.exports = router; 