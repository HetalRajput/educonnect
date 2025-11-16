const Message = require('../models/Message');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Student = require('../models/Student');

const sendMessage = async (req, res) => {
  try {
    const { title, content, recipientType, recipients, priority = 'normal' } = req.body;

    // Validation
    if (!title || !content || !recipientType) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, and recipient type are required'
      });
    }

    let recipientIds = [];

    if (recipientType === 'all') {
      // Get all active staff and students
      const staff = await Staff.find({ 
        organization: req.user.organization._id,
        isActive: true
      }).select('_id');
      
      const students = await Student.find({ 
        organization: req.user.organization._id,
        isActive: true
      }).select('_id');
      
      recipientIds = [
        ...staff.map(s => s._id),
        ...students.map(s => s._id)
      ];
      
    } else if (recipientType === 'staff') {
      // FIXED: Only use specific recipients if provided, otherwise get all staff
      if (recipients && recipients.length > 0) {
        // Use specific staff IDs provided
        recipientIds = await Staff.find({
          _id: { $in: recipients },
          organization: req.user.organization._id,
          isActive: true
        }).distinct('_id');
      } else {
        // Get all staff if no specific recipients provided
        const staff = await Staff.find({ 
          organization: req.user.organization._id,
          isActive: true
        }).select('_id');
        recipientIds = staff.map(s => s._id);
      }
      
    } else if (recipientType === 'students') {
      // FIXED: Only use specific recipients if provided, otherwise get all students
      if (recipients && recipients.length > 0) {
        // Use specific student IDs provided
        recipientIds = await Student.find({
          _id: { $in: recipients },
          organization: req.user.organization._id,
          isActive: true
        }).distinct('_id');
      } else {
        // Get all students if no specific recipients provided
        const students = await Student.find({ 
          organization: req.user.organization._id,
          isActive: true
        }).select('_id');
        recipientIds = students.map(s => s._id);
      }
      
    } else if (recipientType === 'specific' && recipients && recipients.length > 0) {
      // Get specific staff and students from the provided IDs
      const staff = await Staff.find({
        _id: { $in: recipients },
        organization: req.user.organization._id,
        isActive: true
      }).select('_id');
      
      const students = await Student.find({
        _id: { $in: recipients },
        organization: req.user.organization._id,
        isActive: true
      }).select('_id');
      
      recipientIds = [
        ...staff.map(s => s._id),
        ...students.map(s => s._id)
      ];
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient type or missing recipients'
      });
    }

    if (recipientIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recipients found for the specified criteria'
      });
    }

    // Create message
    const message = await Message.create({
      organization: req.user.organization._id,
      sender: req.user._id,
      title,
      content,
      recipients: recipientIds,
      recipientType,
      priority
    });

    // Populate recipient details for response
    const populatedMessage = await Message.findById(message._id)
      .populate('recipients', 'email fName department designation');

    res.status(201).json({
      success: true,
      message: `Message sent successfully to ${recipientIds.length} recipient(s)`,
      data: { 
        message: populatedMessage
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
};
const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const messages = await Message.find({
      recipients: req.user._id,
      organization: req.user.organization._id
    })
    .populate('sender', 'email profile')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Message.countDocuments({
      recipients: req.user._id,
      organization: req.user.organization._id
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
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

const getMessageById = async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      recipients: req.user._id,
      organization: req.user.organization._id
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

const getOrganizationMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const messages = await Message.find({
      organization: req.user.organization._id
    })
    .populate('sender', 'email profile')
    .populate('recipients', 'email profile role')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Message.countDocuments({
      organization: req.user.organization._id
    });

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          totalPages: Math.ceil(total / limit),
          currentPage: parseInt(page),
          total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get organization messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      organization: req.user.organization._id
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting message'
    });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getMessageById,
  getOrganizationMessages,
  deleteMessage
};