const User = require('../models/User');
const Organization = require('../models/Organization');
const { generateToken } = require('../utils/jwt');

// @desc    Register organization
// @route   POST /api/auth/register
// @access  Public
const registerOrganization = async (req, res) => {
  try {
    const { email, organizationName, type, session, password } = req.body;

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
      session
    });

    // Create user with organization role
    const user = await User.create({
      email,
      password,
      role: 'organization',
      organization: organization._id,
      profile: {
        firstName: '',
        lastName: ''
      }
    });

    // Generate token
    const token = generateToken(user._id);

    // Update last login
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
    console.error('Registration error:', error);
    
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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and password is selected
    const user = await User.findOne({ email }).select('+password').populate('organization');
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          organization: user.organization
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

module.exports = {
  registerOrganization,
  login
};