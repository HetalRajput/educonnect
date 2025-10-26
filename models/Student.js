const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
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
  rollNumber: {
    type: String,
    required: true
  },
  class: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  admissionDate: {
    type: Date,
    required: true
  },
  parentInfo: {
    fatherName: String,
    motherName: String,
    fatherOccupation: String,
    motherOccupation: String,
    parentPhone: String,
    parentEmail: String
  },
  emergencyContact: String,
  bloodGroup: String,
  medicalInfo: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure rollNumber is unique within organization
studentSchema.index({ organization: 1, rollNumber: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);