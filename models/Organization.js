const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true,
    maxlength: [100, 'Organization name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['school', 'college'],
    required: [true, 'Organization type is required']
  },
  session: {
    type: String,
    required: [true, 'Session is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Organization', organizationSchema);