const Student = require('../models/Student');
const Message = require('../models/Message');
const admin = require("../config/firebase");

// Get student profile
const getStudentProfile = async (req, res) => {
  try {
  
    const student = await Student.findById(req.user._id);
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

const saveFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
 
    const student = await Student.findByIdAndUpdate(
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

const sendStudentNotification = async (req, res) => {
  try {
    
    const { studentId, title, body } = req.body;

    const student = await Student.findById(studentId);

    if (!student || !student.fcmToken) {
      return res.status(404).json({
        success: false,
        message: "Student or FCM token not found"
      });
    }


    const message = {
      token: student.fcmToken,
      notification: {
        title,
        body
      }
    };

    const response = await admin.messaging().send(message);

    res.json({
      success: true,
      message: "Notification sent successfully",
      data: response
    });

  } catch (error) {
    console.error("FCM Error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending notification"
    });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getStudentMessages,
  saveFcmToken,
  sendStudentNotification
};
