const express = require('express');
const {
  OrganizationList,
  statusUpdate
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All organization routes require organization role
router.use(protect);
router.use(authorize('admin'));

router.get('/list', OrganizationList);
router.put('/statusUpdate', statusUpdate);

module.exports = router;