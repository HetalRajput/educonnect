const validateOrganizationRegistration = (req, res, next) => {
  const { email, password, organizationName, type, session } = req.body;

  if (!email || !password || !organizationName || !type || !session) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, organization name, type and session are required'
    });
  }

  // Removed profile validation for organization registration

  if (!['school', 'college'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Organization type must be school or college'
    });
  }

  next();
};

const validateStaffRegistration = (req, res, next) => {
  const { mobile_no, email, fName, org_id, department, designation } = req.body;

  if (!mobile_no || !email || !fName || !org_id || !department || !designation) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number, email, first name, organization ID, department and designation are required'
    });
  }

  // Validate organization ID format
  if (!mongoose.Types.ObjectId.isValid(org_id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid organization ID format'
    });
  }

  // Validate mobile number format
  if (!/^\d{10,}$/.test(mobile_no)) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number must be at least 10 digits and contain only numbers'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  next();
};

const validateStudentRegistration = (req, res, next) => {
  const { name, fatherName, class: studentClass, section, session, mobileNumber, organizationId } = req.body;

  if (!name || !fatherName || !studentClass || !section || !session || !mobileNumber || !organizationId) {
    return res.status(400).json({
      success: false,
      message: 'Name, father name, class, section, session, mobile number and organization ID are required'
    });
  }

  // Validate organization ID format
  if (!mongoose.Types.ObjectId.isValid(organizationId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid organization ID format'
    });
  }

  // Validate mobile number format (basic validation)
  if (mobileNumber.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number must be at least 10 digits'
    });
  }

  next();
};

module.exports = {
  validateOrganizationRegistration,
  validateStaffRegistration,
  validateStudentRegistration
};