const express = require('express');
const { check } = require('express-validator');
const { validate, commonValidations } = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const fileUpload = require('../utils/fileUpload');
const {
  getMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
  archiveMessage
} = require('../controllers/message.controller');

const router = express.Router();

// Apply protection to all routes
router.use(protect);

// Validation rules
const messageValidation = [
  check('recipient', 'Recipient ID is required').isMongoId(),
  check('subject', 'Subject is required').notEmpty(),
  check('content', 'Content is required').notEmpty(),
  check('type', 'Invalid message type')
    .optional()
    .isIn(['support', 'order', 'general', 'system']),
  check('priority', 'Invalid priority level')
    .optional()
    .isIn(['low', 'medium', 'high']),
  check('order', 'Order ID must be valid')
    .optional()
    .isMongoId(),
  check('parentMessage', 'Parent message ID must be valid')
    .optional()
    .isMongoId()
];

// Routes
router
  .route('/')
  .get(validate([commonValidations.pagination, commonValidations.search]), getMessages)
  .post(
    fileUpload.upload.array('attachments', 5),
    validate(messageValidation),
    createMessage
  );

router
  .route('/:id')
  .get(validate([commonValidations.id]), getMessage)
  .put(
    fileUpload.upload.array('attachments', 5),
    validate([...messageValidation, commonValidations.id]),
    updateMessage
  )
  .delete(validate([commonValidations.id]), deleteMessage);

router.put(
  '/:id/archive',
  validate([commonValidations.id]),
  archiveMessage
);

// Admin routes
router.use(authorize('admin'));

router.get(
  '/admin/all',
  validate([commonValidations.pagination, commonValidations.search]),
  (req, res, next) => {
    req.isAdminRequest = true;
    next();
  },
  getMessages
);

// Middleware to emit real-time updates
router.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function(data) {
    const io = req.app.get('io');
    
    // Emit updates for message changes
    if (data.success && data.data && req.method !== 'GET') {
      const message = data.data;
      
      // Emit to sender's room
      io.to(`user-${message.sender}`).emit('message-update', {
        type: req.method,
        data: message
      });

      // Emit to recipient's room
      io.to(`user-${message.recipient}`).emit('message-update', {
        type: req.method,
        data: message
      });

      // Emit new message notification
      if (req.method === 'POST') {
        io.to(`user-${message.recipient}`).emit('new-message', {
          messageId: message._id,
          sender: message.sender,
          subject: message.subject,
          type: message.type,
          priority: message.priority,
          timestamp: message.createdAt
        });
      }

      // Emit status changes
      if (message.status) {
        io.to(`message-${message._id}`).emit('status-update', {
          messageId: message._id,
          status: message.status,
          timestamp: new Date()
        });
      }
    }

    return originalJson.call(this, data);
  };
  next();
});

module.exports = router; 