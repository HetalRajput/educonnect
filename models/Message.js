const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Message title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  recipientType: {
    type: String,
    enum: ['all', 'staff', 'students', 'specific'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  isRead: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for better performance
messageSchema.index({ organization: 1, createdAt: -1 });
messageSchema.index({ recipients: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);