const express = require('express');
const {
  sendMessage,
  getMessages,
  getMessageById,
  getOrganizationMessages,
  deleteMessage
} = require('../controllers/messageController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Organization can send and manage messages
router.post('/send', protect, authorize('organization'), sendMessage);
router.get('/organization', protect, authorize('organization'), getOrganizationMessages);
router.delete('/:id', protect, authorize('organization'), deleteMessage);

// Staff and Students can view messages
router.get('/', protect, authorize('staff', 'student'), getMessages);
router.get('/:id', protect, authorize('staff', 'student'), getMessageById);

module.exports = router;