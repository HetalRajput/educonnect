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
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  contact: {
    phone: String,
    email: String
  },
  settings: {
    academicYear: String,
    maxStudents: Number,
    maxStaff: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for staff count
organizationSchema.virtual('staffCount', {
  ref: 'Staff',
  localField: '_id',
  foreignField: 'organization',
  count: true
});

// Virtual for student count
organizationSchema.virtual('studentCount', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'organization',
  count: true
});

module.exports = mongoose.model('Organization', organizationSchema);