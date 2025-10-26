const express = require('express');
const {
  sendMessage,
  getMessages,
  getMessageById
} = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Organization can send messages
router.post('/send', protect, authorize('organization'), sendMessage);

// Staff and Students can view messages
router.get('/', protect, authorize('staff', 'student'), getMessages);
router.get('/:id', protect, authorize('staff', 'student'), getMessageById);

module.exports = router;