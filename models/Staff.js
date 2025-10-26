const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  employeeId: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  joiningDate: {
    type: Date,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  qualifications: [String],
  experience: Number,
  subjects: [String],
  classes: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure employeeId is unique within organization
staffSchema.index({ organization: 1, employeeId: 1 }, { unique: true });

module.exports = mongoose.model('Staff', staffSchema);