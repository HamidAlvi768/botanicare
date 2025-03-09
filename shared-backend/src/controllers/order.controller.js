const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error');
const { paginate, sort } = require('../middleware/validate');
const emailService = require('../utils/email');
const paymentService = require('../utils/payment');

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private/Admin
exports.getOrders = async (req, res, next) => {
  try {
    const query = Order.find();

    // Apply search if provided
    if (req.query.search) {
      query.or([
        { orderNumber: { $regex: req.query.search, $options: 'i' } },
        { 'shippingAddress.firstName': { $regex: req.query.search, $options: 'i' } },
        { 'shippingAddress.lastName': { $regex: req.query.search, $options: 'i' } }
      ]);
    }

    // Apply user filter
    if (req.query.user) {
      query.where('user', req.query.user);
    }

    // Apply status filter
    if (req.query.status) {
      query.where('orderStatus', req.query.status);
    }

    // Apply payment status filter
    if (req.query.paymentStatus) {
      query.where('paymentStatus', req.query.paymentStatus);
    }

    // Apply date range filter
    if (req.query.startDate) {
      query.where('createdAt').gte(new Date(req.query.startDate));
    }
    if (req.query.endDate) {
      query.where('createdAt').lte(new Date(req.query.endDate));
    }

    // Apply sorting
    if (req.query.sort) {
      sort(query, req.query.sort);
    } else {
      query.sort('-createdAt');
    }

    // Apply pagination
    const { query: paginatedQuery, skip, limit } = paginate(query, {
      page: parseInt(req.query.page, 10),
      limit: parseInt(req.query.limit, 10)
    });

    // Execute query
    const [orders, total] = await Promise.all([
      paginatedQuery
        .populate('user', 'firstName lastName email')
        .populate('items.product', 'name'),
      Order.countDocuments(query.getQuery())
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        total
      },
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name images price');

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    // Check if user is authorized to view this order
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this order', 401));
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    // Check if all products exist and are in stock
    for (const item of req.body.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return next(
          new ErrorResponse(`Product not found with id ${item.product}`, 404)
        );
      }

      if (product.stock < item.quantity) {
        return next(
          new ErrorResponse(
            `Product ${product.name} does not have enough stock`,
            400
          )
        );
      }

      // Set the price from the product
      item.price = product.price;
    }

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent(
      req.body.total,
      'usd',
      { orderId: req.body.orderNumber }
    );

    // Create order
    const order = await Order.create(req.body);

    // Update product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Send order confirmation email
    await emailService.sendOrderConfirmation(order, req.user);

    res.status(201).json({
      success: true,
      data: order,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    // Update order status
    order.orderStatus = req.body.status;
    order.statusHistory.push({
      status: req.body.status,
      note: req.body.note
    });

    if (req.body.trackingNumber) {
      order.trackingNumber = req.body.trackingNumber;
    }

    if (req.body.estimatedDeliveryDate) {
      order.estimatedDeliveryDate = new Date(req.body.estimatedDeliveryDate);
    }

    await order.save();

    // Get user
    const user = await User.findById(order.user);

    // Send order status update email
    await emailService.sendOrderStatusUpdate(order, user);

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process order refund
// @route   POST /api/v1/orders/:id/refund
// @access  Private/Admin
exports.processRefund = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    if (order.paymentStatus === 'refunded') {
      return next(new ErrorResponse('Order has already been refunded', 400));
    }

    // Process refund through payment service
    const refund = await paymentService.processRefund(
      order.paymentIntent,
      req.body.amount || order.total
    );

    // Update order status
    order.paymentStatus = 'refunded';
    order.orderStatus = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      note: 'Order refunded'
    });

    await order.save();

    // Return products to stock if full refund
    if (!req.body.amount || req.body.amount === order.total) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    res.status(200).json({
      success: true,
      data: order,
      refund
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics
// @route   GET /api/v1/orders/stats
// @access  Private/Admin
exports.getOrderStats = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      {
        $facet: {
          totalOrders: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                revenue: { $sum: '$total' }
              }
            }
          ],
          ordersByStatus: [
            {
              $group: {
                _id: '$orderStatus',
                count: { $sum: 1 }
              }
            }
          ],
          ordersByDate: [
            {
              $group: {
                _id: {
                  $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                count: { $sum: 1 },
                revenue: { $sum: '$total' }
              }
            },
            { $sort: { _id: -1 } },
            { $limit: 30 }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    next(error);
  }
}; 