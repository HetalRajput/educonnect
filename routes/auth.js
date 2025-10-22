const express = require('express');
const {
  registerOrganization,
  login
} = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validation');

const router = express.Router();

router.post('/register', validateRegistration, registerOrganization);
router.post('/login', login);

module.exports = router;