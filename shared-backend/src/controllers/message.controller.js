const Message = require('../models/Message');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error');
const { paginate, sort } = require('../middleware/validate');
const fileUpload = require('../utils/fileUpload');

// @desc    Get all messages
// @route   GET /api/v1/messages
// @access  Private
exports.getMessages = async (req, res, next) => {
  try {
    const query = Message.find();

    // If not admin, only show messages where user is sender or recipient
    if (req.user.role !== 'admin') {
      query.or([{ sender: req.user.id }, { recipient: req.user.id }]);
    }

    // Apply search if provided
    if (req.query.search) {
      query.or([
        { subject: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } }
      ]);
    }

    // Apply status filter
    if (req.query.status) {
      query.where('status', req.query.status);
    }

    // Apply type filter
    if (req.query.type) {
      query.where('type', req.query.type);
    }

    // Apply priority filter
    if (req.query.priority) {
      query.where('priority', req.query.priority);
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
    const [messages, total] = await Promise.all([
      paginatedQuery
        .populate('sender', 'firstName lastName email')
        .populate('recipient', 'firstName lastName email')
        .populate('order', 'orderNumber')
        .populate('parentMessage', 'subject'),
      Message.countDocuments(query.getQuery())
    ]);

    res.status(200).json({
      success: true,
      count: messages.length,
      pagination: {
        page: Math.floor(skip / limit) + 1,
        limit,
        total
      },
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single message
// @route   GET /api/v1/messages/:id
// @access  Private
exports.getMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'firstName lastName email')
      .populate('recipient', 'firstName lastName email')
      .populate('order', 'orderNumber')
      .populate('parentMessage', 'subject')
      .populate('replies');

    if (!message) {
      return next(new ErrorResponse('Message not found', 404));
    }

    // Check if user is authorized to view this message
    if (
      req.user.role !== 'admin' &&
      message.sender.toString() !== req.user.id &&
      message.recipient.toString() !== req.user.id
    ) {
      return next(new ErrorResponse('Not authorized to access this message', 401));
    }

    // Mark message as read if recipient is viewing
    if (
      message.recipient.toString() === req.user.id &&
      message.status === 'unread'
    ) {
      await message.markAsRead();
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create message
// @route   POST /api/v1/messages
// @access  Private
exports.createMessage = async (req, res, next) => {
  try {
    req.body.sender = req.user.id;

    // Handle file uploads
    if (req.files) {
      const attachments = [];
      const files = Array.isArray(req.files) ? req.files : [req.files];

      for (const file of files) {
        const uploadedFile = await fileUpload.upload.single('file')(file);
        attachments.push({
          filename: file.originalname,
          path: fileUpload.getFileUrl(uploadedFile.filename),
          mimetype: file.mimetype,
          size: file.size
        });
      }

      req.body.attachments = attachments;
    }

    const message = await Message.create(req.body);

    // If this is a reply, update parent message
    if (req.body.parentMessage) {
      await Message.findByIdAndUpdate(req.body.parentMessage, {
        $push: { replies: message._id }
      });
    }

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update message
// @route   PUT /api/v1/messages/:id
// @access  Private
exports.updateMessage = async (req, res, next) => {
  try {
    let message = await Message.findById(req.params.id);

    if (!message) {
      return next(new ErrorResponse('Message not found', 404));
    }

    // Check if user is authorized to update this message
    if (
      req.user.role !== 'admin' &&
      message.sender.toString() !== req.user.id
    ) {
      return next(new ErrorResponse('Not authorized to update this message', 401));
    }

    // Handle file uploads
    if (req.files) {
      // Delete old attachments
      for (const attachment of message.attachments) {
        await fileUpload.deleteFile(attachment.path);
      }

      const attachments = [];
      const files = Array.isArray(req.files) ? req.files : [req.files];

      for (const file of files) {
        const uploadedFile = await fileUpload.upload.single('file')(file);
        attachments.push({
          filename: file.originalname,
          path: fileUpload.getFileUrl(uploadedFile.filename),
          mimetype: file.mimetype,
          size: file.size
        });
      }

      req.body.attachments = attachments;
    }

    message = await Message.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message
// @route   DELETE /api/v1/messages/:id
// @access  Private
exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return next(new ErrorResponse('Message not found', 404));
    }

    // Check if user is authorized to delete this message
    if (
      req.user.role !== 'admin' &&
      message.sender.toString() !== req.user.id
    ) {
      return next(new ErrorResponse('Not authorized to delete this message', 401));
    }

    // Delete attachments
    for (const attachment of message.attachments) {
      await fileUpload.deleteFile(attachment.path);
    }

    await message.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive message
// @route   PUT /api/v1/messages/:id/archive
// @access  Private
exports.archiveMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return next(new ErrorResponse('Message not found', 404));
    }

    // Check if user is authorized to archive this message
    if (
      req.user.role !== 'admin' &&
      message.recipient.toString() !== req.user.id
    ) {
      return next(new ErrorResponse('Not authorized to archive this message', 401));
    }

    await message.archive();

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
}; 