const Organization = require('../models/Organization');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Student = require('../models/Student');

// Get organization dashboard
const getOrganizationDashboard = async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization._id)
      .populate('staffCount')
      .populate('studentCount');

    const staff = await Staff.find({ organization: req.user.organization._id })
      .populate('user', 'profile email lastLogin')
      .limit(5);

    const students = await Student.find({ organization: req.user.organization._id })
      .populate('user', 'profile email lastLogin')
      .limit(5);

    res.json({
      success: true,
      data: {
        organization,
        recentStaff: staff,
        recentStudents: students
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
};

// Get all staff in organization
const getOrganizationStaff = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, search } = req.query;
    
    // Build query
    let query = { organization: req.user.organization._id };
    
    if (department && department !== 'all') {
      query.department = department;
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { fName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile_no: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }

    // Get staff with pagination
    const staff = await Staff.find(query)
      .select('-__v') // Exclude version key
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean(); // Better performance

    const total = await Staff.countDocuments(query);

    res.json({
      success: true,
      data: {
        staff,
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
    console.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching staff'
    });
  }
};

// Get all students in organization
const getOrganizationStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, class: studentClass, section, search } = req.query;
    
    console.log('Fetching students for organization:', req.user.organization._id);
    
    let query = { organization: req.user.organization._id };
    
    // Add filters
    if (studentClass && studentClass !== 'all') {
      query.class = studentClass;
    }
    if (section && section !== 'all') {
      query.section = section;
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
        { class: { $regex: search, $options: 'i' } },
        { section: { $regex: search, $options: 'i' } }
      ];
    }

    // Get students without populate
    const students = await Student.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean(); // Better performance

    const total = await Student.countDocuments(query);

    console.log(`Found ${students.length} students out of ${total} total`);

    res.json({
      success: true,
      data: {
        students,
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
    console.error('Get students error details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching students',
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
};

// Update organization profile
const updateOrganization = async (req, res) => {
  try {
    const { address, contact, settings } = req.body;

    const organization = await Organization.findByIdAndUpdate(
      req.user.organization._id,
      { address, contact, settings },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: { organization }
    });

  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating organization'
    });
  }
};

module.exports = {
  getOrganizationDashboard,
  getOrganizationStaff,
  getOrganizationStudents,
  updateOrganization
};