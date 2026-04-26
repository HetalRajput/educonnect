const express = require('express');
const {
  sendMessage,
} = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Organization can send and manage messages
router.post('/send', protect, authorize('organization'), sendMessage);

// Staff and Students can view messages

module.exports = router;