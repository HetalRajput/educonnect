const Staff = require('../models/Staff');
const Message = require('../models/Message');

// Get staff profile
const getStaffProfile = async (req, res) => {
  try {
    const staff = await Staff.findOne({ user: req.user._id })
      .populate('user', 'email profile lastLogin')
      .populate('organization', 'name type session');

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff profile not found'
      });
    }

    res.json({
      success: true,
      data: { staff }
    });

  } catch (error) {
    console.error('Get staff profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff profile'
    });
  }
};

// Update staff profile
const updateStaffProfile = async (req, res) => {
  try {
    const { department, designation, qualifications, experience } = req.body;

    const staff = await Staff.findOneAndUpdate(
      { user: req.user._id },
      {
        department,
        designation,
        qualifications,
        experience
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Staff profile updated successfully',
      data: { staff }
    });

  } catch (error) {
    console.error('Update staff profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating staff profile'
    });
  }
};

// Get staff messages
const getStaffMessages = async (req, res) => {
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
    console.error('Get staff messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
};

module.exports = {
  getStaffProfile,
  updateStaffProfile,
  getStaffMessages
};