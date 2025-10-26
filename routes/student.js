const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getStudentProfile, updateStudentProfile, getStudentMessages } = require('../controllers/studentController');

const router = express.Router();

// All student routes require student role
router.use(protect);
router.use(authorize('student'));

// Student profile routes
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

// Student messages
router.get('/messages', getStudentMessages);

module.exports = router;