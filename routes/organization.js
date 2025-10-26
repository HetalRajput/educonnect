const express = require('express');
const {
  getOrganizationDashboard,
  getOrganizationStaff,
  getOrganizationStudents,
  updateOrganization
} = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All organization routes require organization role
router.use(protect);
router.use(authorize('organization'));

// Dashboard
router.get('/dashboard', getOrganizationDashboard);
router.get('/staff', getOrganizationStaff);
router.get('/students', getOrganizationStudents);
router.put('/profile', updateOrganization);

module.exports = router;