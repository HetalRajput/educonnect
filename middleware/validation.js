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
  const { email, password, profile, employeeId, department, designation, joiningDate, salary } = req.body;

  if (!email || !password || !employeeId || !department || !designation || !joiningDate || !salary) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, employeeId, department, designation, joiningDate and salary are required'
    });
  }

  if (!profile?.firstName || !profile?.lastName) {
    return res.status(400).json({
      success: false,
      message: 'First name and last name are required in profile'
    });
  }

  next();
};

const validateStudentRegistration = (req, res, next) => {
  const { email, password, profile, rollNumber, class: studentClass, section, admissionDate } = req.body;

  if (!email || !password || !rollNumber || !studentClass || !section || !admissionDate) {
    return res.status(400).json({
      success: false,
      message: 'Email, password, rollNumber, class, section and admissionDate are required'
    });
  }

  if (!profile?.firstName || !profile?.lastName) {
    return res.status(400).json({
      success: false,
      message: 'First name and last name are required in profile'
    });
  }

  next();
};

module.exports = {
  validateOrganizationRegistration,
  validateStaffRegistration,
  validateStudentRegistration
};