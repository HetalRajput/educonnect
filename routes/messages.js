const express = require('express');
const {
  sendMessage,
  getStaffMessages,
  getStudentMessages,
} = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Organization can send and manage messages
router.post('/send', protect, authorize('organization'), sendMessage);

// Staff and Students can view messages
router.get('/staff', getStaffMessages);
router.get('/student', getStudentMessages);

module.exports = router;