const messageModel = require('../models/Message');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Student = require('../models/Student');

const sendMessage = async (req, res) => {
  try {
    const { title, content, session, userType, class_id, staff_id } = req.body;
    const organization = req.user.organization._id;
    // console.log(req.body); return;
    
    // Validation
    if (!title || !content || !userType) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and user type are required'
      });
    }


    const data = new messageModel({
        organization: organization,
        title: title,
        content: content,
        session: session,
        userType: userType,
        class_id: class_id,
        staff_id: staff_id
    });
       
    const saveData =await data.save();

    if (saveData) {
      res.status(200).send({message: "Message sent successfully", status: true, data: saveData});
    }

  } catch (error) {
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