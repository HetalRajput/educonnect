const { registerValidation } = require('../utils/validation');

const validateRegistration = (req, res, next) => {
  console.log('Received registration data:', req.body);
  console.log('Headers:', req.headers);
  
  const { error } = registerValidation(req.body);
  
  if (error) {
    console.log('Validation error details:', error.details);
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
      field: error.details[0].path[0], // Show which field has error
      receivedData: req.body // Return what was actually received
    });
  }
  
  next();
};

module.exports = {
  validateRegistration
};