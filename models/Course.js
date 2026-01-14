const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Course', courseSchema);