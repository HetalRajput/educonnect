const User = require('../models/User');
const Organization = require('../models/Organization');
const Staff = require('../models/Staff');
const Student = require('../models/Student');
const { generateToken } = require('../utils/jwt');

// Get all organizations with ID and name (Public)
const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find({ isActive: true })
      .select('_id name type session contact')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: {
        organizations: organizations.map(org => ({
          id: org._id,
          name: org.name,
          type: org.type,
          session: org.session,
          
        })),
        count: organizations.length
      }
    });

  } catch (error) {
    console.error('Get organizations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching organizations'
    });
  }
};

// Staff Login with Organization ID
const loginStaff = async (req, res) => {
  try {
    const { email, password, organizationId } = req.body;

    if (!email || !password || !organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Email, password and organization ID are required'
      });
    }

    // Normalize email and find staff user
    const user = await User.findOne({ 
      email: email.toLowerCase().trim(), // Add this line
      organization: organizationId,
      role: 'staff'
    })
    .select('+password')
    .populate('organization');

    if (!user) {
      // Debug: Check what's available
      console.log('Searching for staff:', {
        email: email.toLowerCase().trim(),
        organization: organizationId
      });
      
      const availableStaff = await User.find({
        organization: organizationId,
        role: 'staff'
      }).select('email');
      
      console.log('Available staff emails:', availableStaff.map(u => u.email));
      
      return res.status(401).json({
        success: false,
        message: 'No staff account found with this email in the selected organization'
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Staff account is deactivated. Please contact your organization.'
      });
    }

    const token = generateToken(user._id);

    user.lastLogin = new Date();
    await user.save();

    const staffProfile = await Staff.findOne({ user: user._id });

    res.json({
      success: true,
      message: 'Staff login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          organization: {
            id: user.organization._id,
            name: user.organization.name,
            type: user.organization.type,
            session: user.organization.session
          },
          staffProfile: staffProfile,
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during staff login'
    });
  }
};
// Student Login with Organization ID
const loginStudent = async (req, res) => {
  try {
    const { organizationId, mobileNumber } = req.body;

    if (!organizationId || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Organization ID and mobile number are required'
      });
    }

    // Debug: Log the search criteria
    console.log('Searching for student:', {
      organization: organizationId,
      mobileNumber: mobileNumber.trim()
    });

    // Find student by organization and mobile number directly in Student collection
    const student = await Student.findOne({ 
      organization: organizationId,
      mobileNumber: mobileNumber.trim()
    });

    console.log('Found student:', student); // Debug: See if student is found

    if (!student) {
      // Additional debug: Check if any student exists with this mobile number
      const anyStudent = await Student.findOne({ 
        mobileNumber: mobileNumber.trim()
      });
      console.log('Any student with this mobile number:', anyStudent);
      
      return res.status(401).json({
        success: false,
        message: 'No student found with this mobile number in the selected organization'
      });
    }

    // Check if student is active
    if (!student.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Student account is deactivated. Please contact your organization.'
      });
    }

    // Generate token (using student ID instead of user ID)
    const token = generateToken(student._id);

    // Update last login
    student.lastLogin = new Date();
    await student.save();

    res.json({
      success: true,
      message: 'Student login successful',
      data: {
        token,
        student: {
          id: student._id,
          name: student.name,
          fatherName: student.fatherName,
          class: student.class,
          section: student.section,
          session: student.session,
          mobileNumber: student.mobileNumber,
          organization: organizationId,
          lastLogin: student.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during student login'
    });
  }
};

// Organization Login (No organization ID needed)
const loginOrganization = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find organization user by email
    const user = await User.findOne({ 
      email,
      role: 'organization'
    })
    .select('+password')
    .populate('organization');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No organization account found with this email'
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Organization account is deactivated.'
      });
    }

    const token = generateToken(user._id);

    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Organization login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          organization: {
            id: user.organization._id,
            name: user.organization.name,
            type: user.organization.type,
            session: user.organization.session
          },
          lastLogin: user.lastLogin
        }
      }
    });

  } catch (error) {
    console.error('Organization login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during organization login'
    });
  }
};

// Register Organization
const registerOrganization = async (req, res) => {
  try {
    const { email, password, organizationName, type, session, address, contact, settings } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create organization
    const organization = await Organization.create({
      name: organizationName,
      type,
      session,
      address,
      contact,
      settings
    });

    // Create user with organization role - without profile
    const user = await User.create({
      email,
      password,
      role: 'organization',
      organization: organization._id
      // Profile section removed
    });

    const token = generateToken(user._id);

    user.lastLogin = new Date();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          organization: {
            id: organization._id,
            name: organization.name,
            type: organization.type,
            session: organization.session
          }
        }
      }
    });
  } catch (error) {
    console.error('Organization registration error:', error);
    
    // If organization was created but user creation failed, delete the organization
    if (req.body.organizationName) {
      await Organization.findOneAndDelete({ name: req.body.organizationName });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Register Staff under Organization
const registerStaff = async (req, res) => {
  try {
    const { 
      email, password, profile, 
      employeeId, department, designation, 
      joiningDate, salary, qualifications, 
      experience, subjects, classes 
    } = req.body;

    const organizationId = req.user.organization._id;

    // Check if staff already exists in this organization
    const existingUser = await User.findOne({ email, organization: organizationId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Staff with this email already exists in your organization'
      });
    }

    // Check if employeeId already exists in this organization
    const existingStaff = await Staff.findOne({ 
      organization: organizationId, 
      employeeId 
    });
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'Staff with this employee ID already exists in your organization'
      });
    }

    // Create user with staff role
    const user = await User.create({
      email,
      password,
      role: 'staff',
      organization: organizationId,
      profile
    });

    // Create staff profile
    const staff = await Staff.create({
      user: user._id,
      organization: organizationId,
      employeeId,
      department,
      designation,
      joiningDate,
      salary,
      qualifications,
      experience,
      subjects,
      classes
    });

    res.status(201).json({
      success: true,
      message: 'Staff registered successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: 'staff',
          profile: user.profile,
          organization: {
            id: organizationId,
            name: req.user.organization.name
          },
          staffProfile: {
            id: staff._id,
            employeeId: staff.employeeId,
            department: staff.department,
            designation: staff.designation
          }
        }
      }
    });

  } catch (error) {
    console.error('Staff registration error:', error);
    
    // Cleanup if user was created but staff creation failed
    if (req.body.email) {
      await User.findOneAndDelete({ email: req.body.email, organization: req.user.organization._id });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during staff registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Register Student under Organization
const registerStudent = async (req, res) => {
  try {
    const { 
      name,
      fatherName,
      class: studentClass,
      section,
      session,
      mobileNumber,
      organizationId
    } = req.body;

    // Check if organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(400).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if student with same name and father name already exists in this organization
    const existingStudent = await Student.findOne({ 
      organization: organizationId, 
      name,
      fatherName 
    });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this name and father name already exists in this organization'
      });
    }

    // Check if mobile number already exists (globally unique)
    const existingMobile = await Student.findOne({ mobileNumber });
    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: 'Student with this mobile number already exists'
      });
    }

    // Create student profile
    const student = await Student.create({
      organization: organizationId,
      name,
      fatherName,
      class: studentClass,
      section,
      session,
      mobileNumber
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: {
        student: {
          id: student._id,
          name: student.name,
          fatherName: student.fatherName,
          class: student.class,
          section: student.section,
          session: student.session,
          mobileNumber: student.mobileNumber,
          organization: organizationId
        }
      }
    });

  } catch (error) {
    console.error('Student registration error:', error);
    
    // Handle duplicate mobile number error
    if (error.code === 11000 && error.keyPattern.mobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'Student with this mobile number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during student registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  registerOrganization,
  registerStaff,
  registerStudent,
  loginStaff,
  loginStudent,
  loginOrganization,
  getAllOrganizations
};