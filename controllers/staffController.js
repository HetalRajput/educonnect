const Staff = require('../models/Staff');
const messageModel = require('../models/Message');

// Get staff profile
const getStaffProfile = async (req, res) => {
  try {
    
    const staff = await Staff.findById(req.user._id );

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

    const staffId = req.user._id.toString();
    const organizationId = req.user.organization._id;

    const messages = await messageModel.find({
      organization: organizationId,
      userType: "staff",
      $or: [
        { staff_id: "all" },
        { staff_id: { $regex: staffId } }
      ]
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

    const total = await messageModel.countDocuments({
      organization: organizationId,
      userType: "staff",
      $or: [
        { staff_id: "all" },
        { staff_id: { $regex: staffId } }
      ]
    });

    res.status(200).json({
      success: true,
      message: "Staff messages fetched successfully",
      data: messages,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalMessages: total
      }
    });

  } catch (error) {
    console.error("Get staff messages error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching messages"
    });
  }
};

const saveFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
 
    const student = await Staff.findByIdAndUpdate(
      req.user._id,
      { fcmToken },
      { new: true }
    );

    res.json({
      success: true,
      message: 'FCM token saved successfully',
      data: { student }
    });
  } catch (error) {
    console.error('Save FCM token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving FCM token'
    });
  }
};

module.exports = {
  getStaffProfile,
  updateStaffProfile,
  getStaffMessages,
  saveFcmToken
};