const express = require('express');
const {
  getOrganizationDashboard,
  getOrganizationStaff,
  getOrganizationStudents,
  updateOrganization,
  getOrganizationProfile,
  saveFcmToken,
} = require('../controllers/organizationController');

const { addCourse, getCourse } = require('../controllers/courseController');
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
router.post('/fcmtoken-save', saveFcmToken);

router.post('/courseAdd', addCourse);
router.post('/courseList', getCourse);
router.get('/profile', getOrganizationProfile);

module.exports = router;