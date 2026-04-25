const messageModel = require('../models/Message');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Student = require('../models/Student');
const admin = require("../config/firebase");

const sendMessage = async (req, res) => {
  try {
    const { title, content, session, userType, class_id, staff_id, staff_ids } = req.body;
    const organization = req.user.organization._id;

    if (!title || !content || !userType) {
      return res.status(400).json({
        success: false,
        message: "Title, content, and user type are required"
      });
    }

    const data = new messageModel({
      organization,
      title,
      content,
      session,
      userType,
      class_id,
      staff_id,
      staff_ids,
    });

    const saveData = await data.save();

    if (!saveData) {
      return res.status(500).json({
        success: false,
        message: "Message not saved"
      });
    }

    let tokens = [];

    // 🔹 Send notification to students
    if (userType === "students") {
      const students = await Student.find({
        organization: organization,
        class: class_id,
        fcmToken: { $ne: null }
      });

      tokens = students.map(student => student.fcmToken);
    }
    
    // 🔹 Send notification to staff
    else if (userType === "staff") {
    
      const staff = await Staff.find({
        _id: { $in: staff_ids },
        fcmToken: { $ne: null }
      });

      tokens = staff.map(s => s.fcmToken);
    }

    // 🔹 Send push notification
    if (tokens.length > 0) {
      const message = {
        tokens: tokens,
        notification: {
          title: title,
          body: content
        }
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      console.log("Push sent:", response.successCount);
    }

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: saveData
    });

  } catch (error) {
    console.error("Notification Error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getStaffMessages = async (req, res) => {
  try{
    const { staff_id } = req.query;
    
    const messages = await messageModel.find({ staff_id: staff_id, userType: 'staff' }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
};

const getStudentMessages = async (req, res) => {
  try{
    const { class_id } = req.query;
    
    const messages = await messageModel.find({ class_id: class_id, userType: 'students' }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
};

module.exports = {
  sendMessage,
  getStaffMessages,
  getStudentMessages
};