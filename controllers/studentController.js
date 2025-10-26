const Student = require('../models/Student');
const Message = require('../models/Message');

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id })
      .populate('user', 'email profile lastLogin')
      .populate('organization', 'name type session');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.json({
      success: true,
      data: { student }
    });

  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student profile'
    });
  }
};

// Update student profile
const updateStudentProfile = async (req, res) => {
  try {
    const { emergencyContact, bloodGroup } = req.body;

    const student = await Student.findOneAndUpdate(
      { user: req.user._id },
      {
        emergencyContact,
        bloodGroup
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Student profile updated successfully',
      data: { student }
    });

  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating student profile'
    });
  }
};

// Get student messages
const getStudentMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const messages = await Message.find({
      organization: req.user.organization._id,
      recipients: req.user._id,
      isActive: true
    })
    .populate('sender', 'email profile')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Message.countDocuments({
      organization: req.user.organization._id,
      recipients: req.user._id,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        messages,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Get student messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getStudentMessages
};