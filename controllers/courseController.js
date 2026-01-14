const Course = require('../models/Course');

// Get course details
const getCourse = async (req, res) => {
  try {
    const { organization_id } = req.body;
    const courses = await Course.find({"organization": organization_id});

    if (!courses) {
      return res.status(404).json({
        success: false,
        message: 'Courses not found'
      });
    }

    res.json({
      success: true,
      data: { courses }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching course details'
    });
  }
};

const addCourse = async (req, res) => {
  try {
    const { organization_id, name } = req.body;

    const newCourse = await Course.create({ organization: organization_id, name });
    res.json({
      success: true,
      message: 'Course added successfully',
      data: { course: newCourse }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while adding course'
    });
  }
};


module.exports = {
  getCourse,
  addCourse
};