const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getStaffProfile, updateStaffProfile, getStaffMessages } = require('../controllers/staffController');

const router = express.Router();

// All staff routes require staff role
router.use(protect);
router.use(authorize('staff'));

// Staff profile routes
router.get('/profile', getStaffProfile);
router.put('/profile', updateStaffProfile);

// Staff messages
router.get('/messages', getStaffMessages);

module.exports = router;    