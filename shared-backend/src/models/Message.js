const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'archived'],
    default: 'unread'
  },
  type: {
    type: String,
    enum: ['support', 'order', 'general', 'system'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  }],
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  readAt: Date,
  archivedAt: Date
}, {
  timestamps: true
});

// Update readAt timestamp when message is read
messageSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Archive message
messageSchema.methods.archive = function() {
  this.status = 'archived';
  this.archivedAt = new Date();
  return this.save();
};

// Add reply
messageSchema.methods.addReply = function(replyMessageId) {
  if (!this.replies.includes(replyMessageId)) {
    this.replies.push(replyMessageId);
  }
  return this.save();
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 