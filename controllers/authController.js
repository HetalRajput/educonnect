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
    const { email, password, organizationId, mobile_no } = req.body;

    // Check if using new format (mobile_no) or old format (email/password)
    if (mobile_no && organizationId) {
      // NEW LOGIN FORMAT - mobile number + organizationId
      if (!organizationId || !mobile_no) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID and mobile number are required'
        });
      }

      // Find staff by organization and mobile number
      const staff = await Staff.findOne({ 
        organization: organizationId,
        mobile_no: mobile_no.trim()
      }).populate('organization');

      if (!staff) {
        return res.status(401).json({
          success: false,
          message: 'No staff found with this mobile number in the selected organization'
        });
      }

      if (!staff.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Staff account is deactivated'
        });
      }

      const token = generateToken(staff._id);
      staff.lastLogin = new Date();
      await staff.save();

      return res.json({
        success: true,
        message: 'Staff login successful',
        data: {
          token,
          staff: {
            id: staff._id,
            mobile_no: staff.mobile_no,
            email: staff.email,
            fName: staff.fName,
            department: staff.department,
            designation: staff.designation,
            organization: {
              id: staff.organization._id,
              name: staff.organization.name,
              type: staff.organization.type,
              session: staff.organization.session
            },
            lastLogin: staff.lastLogin
          }
        }
      });

    } else {
      // OLD LOGIN FORMAT - email + password + organizationId (for backward compatibility)
      if (!email || !password || !organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Email, password and organization ID are required'
        });
      }

      // Your existing old login code here...
      const user = await User.findOne({ 
        email: email.toLowerCase().trim(),
        organization: organizationId,
        role: 'staff'
      }).select('+password').populate('organization');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No staff account found with this email in the selected organization'
        });
      }

      // ... rest of old login code
    }

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
      mobile_no,
      email,
      fName,
      org_id,
      department,
      designation
    } = req.body;

    // Check if organization exists
    const organization = await Organization.findById(org_id);
    if (!organization) {
      return res.status(400).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if mobile number already exists
    const existingMobile = await Staff.findOne({ mobile_no });
    if (existingMobile) {
      return res.status(400).json({
        success: false,
        message: 'Staff with this mobile number already exists'
      });
    }

    // Check if email already exists
    const existingEmail = await Staff.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Staff with this email already exists'
      });
    }

    // Create staff profile
    const staff = await Staff.create({
      organization: org_id,
      mobile_no,
      email: email.toLowerCase().trim(),
      fName,
      department,
      designation
    });

    res.status(201).json({
      success: true,
      message: 'Staff registered successfully',
      data: {
        staff: {
          id: staff._id,
          mobile_no: staff.mobile_no,
          email: staff.email,
          fName: staff.fName,
          department: staff.department,
          designation: staff.designation,
          organization: org_id
        }
      }
    });

  } catch (error) {
    console.error('Staff registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      if (error.keyPattern.mobile_no) {
        return res.status(400).json({
          success: false,
          message: 'Staff with this mobile number already exists'
        });
      }
      if (error.keyPattern.email) {
        return res.status(400).json({
          success: false,
          message: 'Staff with this email already exists'
        });
      }
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