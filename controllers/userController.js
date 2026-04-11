const User = require('../models/User');
const Organization = require('../models/Organization');

const OrganizationList = async (req, res) => {
  try {
    
    const organizations = await Organization.find();

    if (!organizations) {
      return res.status(404).json({
        success: false,
        message: 'Organization list not found'
      });
    }

    res.json({
      success: true,
      data: { organizations }
    });

  } catch (error) {
    console.error('Get organization list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching organization list'
    });
  }
};

const statusUpdate = async (req, res) => {
  try {

    const { organizationId, status } = req.body;

    // Update organization status
    const organization = await Organization.findByIdAndUpdate(
      organizationId,
      { isActive:status },
      { new: true }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    // Update all users belonging to this organization
    await User.updateMany(
      { organization: organizationId },
      { isActive: status }
    );

    res.json({
      success: true,
      message: "Organization and users status updated",
      data: organization
    });

  } catch (error) {

    console.error("Status update error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating status"
    });

  }
};

module.exports = {
    OrganizationList,
    statusUpdate
};