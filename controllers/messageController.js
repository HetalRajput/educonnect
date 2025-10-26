const Message = require('../models/Message');
const User = require('../models/User');

// Send message (Organization only)
const sendMessage = async (req, res) => {
  try {
    const { title, content, recipientType, recipients, priority } = req.body;

    let recipientUsers = [];

    if (recipientType === 'all') {
      // Get all active users in the organization
      recipientUsers = await User.find({ 
        organization: req.user.organization._id,
        isActive: true
      }).select('_id');
    } else if (recipientType === 'staff') {
      recipientUsers = await User.find({ 
        organization: req.user.organization._id,
        role: 'staff',
        isActive: true
      }).select('_id');
    } else if (recipientType === 'students') {
      recipientUsers = await User.find({ 
        organization: req.user.organization._id,
        role: 'student',
        isActive: true
      }).select('_id');
    } else if (recipientType === 'specific' && recipients) {
      recipientUsers = await User.find({ 
        _id: { $in: recipients },
        organization: req.user.organization._id,
        isActive: true
      }).select('_id');
    }

    const message = await Message.create({
      organization: req.user.organization._id,
      sender: req.user._id,
      title,
      content,
      recipients: recipientUsers.map(user => user._id),
      recipientType,
      priority
    });

    await message.populate('recipients', 'email profile');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
};

// Get messages for user
const getMessages = async (req, res) => {
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
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
};

// Get message by ID
const getMessageById = async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      organization: req.user.organization._id,
      recipients: req.user._id,
      isActive: true
    }).populate('sender', 'email profile');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      data: { message }
    });

  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching message'
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getMessageById
};