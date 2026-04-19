const express = require('express');
const { getStudentProfile, updateStudentProfile, getStudentMessages,saveFcmToken } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All student routes require student role
router.use(protect);
router.use(authorize('student'));

// Student profile routes
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

// Student messages
router.get('/messages', getStudentMessages);
router.post('/fcmtoken-save', saveFcmToken);

module.exports = router;