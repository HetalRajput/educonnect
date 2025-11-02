const express = require('express');
const {
  registerOrganization,
  registerStaff,
  registerStudent,
  loginStaff,
  loginStudent,
  loginOrganization,
  getAllOrganizations
} = require('../controllers/authController');
const { 
  validateOrganizationRegistration, 
  validateStaffRegistration, 
  validateStudentRegistration 
} = require('../middleware/validation');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register/organization', registerOrganization);
router.get('/organizations', getAllOrganizations); // Get all organizations with IDs
router.post('/register/student',registerStudent);


// Login routes
router.post('/login/organization', loginOrganization);
router.post('/login/staff', loginStaff);
router.post('/login/student', loginStudent);

// Protected routes - only organization can register staff/students
router.post('/register/staff', protect, authorize('organization'), validateStaffRegistration, registerStaff);

module.exports = router;