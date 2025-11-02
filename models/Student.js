const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true
  },
  fatherName: {
    type: String,
    required: [true, 'Father name is required'],
    trim: true
  },
  class: {
    type: String,
    required: [true, 'Class is required']
  },
  section: {
    type: String,
    required: [true, 'Section is required']
  },
  session: {
    type: String,
    required: [true, 'Session is required']
  },
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10,}$/.test(v); // At least 10 digits
      },
      message: 'Mobile number must be at least 10 digits'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to ensure unique student within organization
studentSchema.index({ organization: 1, name: 1, fatherName: 1 }, { unique: true });

// Compound index to ensure mobile number is unique within organization
studentSchema.index({ organization: 1, mobileNumber: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);