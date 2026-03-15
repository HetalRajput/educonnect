const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
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
  session: {
    type: String,
    required: [true, 'Session is required']
  },
  userType: {
    type: String,
    enum: ['staff', 'students'],
    required: true
  },
  class_id: {
    type: String,
    required: false
  },
  staff_id: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

// Index for better performance
messageSchema.index({ organization: 1, createdAt: -1 });
messageSchema.index({ recipients: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);