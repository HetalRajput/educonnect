const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Staff = require('../models/Staff');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      let user = await User.findById(decoded.id).populate('organization');
      if(!user) {
        const student = await Student.findById(decoded.id);
        const staff = await Staff.findById(decoded.id);

        if (student) user = { ...student.toObject(), role: 'student' };
        else if (staff) user = { ...staff.toObject(), role: 'staff' };
        else {
          return res.status(401).json({ success: false, message: "User not found" });
        }
      }
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

const authorize = (...roles) => {  
  return (req, res, next) => {

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };