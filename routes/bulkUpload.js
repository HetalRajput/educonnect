const express = require('express');
const upload = require('../middleware/upload');
const {
  downloadStudentCSV,
  downloadStaffCSV,
  uploadStudentCSV,
  uploadStaffCSV
} = require('../controllers/bulkUploadController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.use(authorize('organization'));



// Public routes

router.get('/download-student-csv', downloadStudentCSV);
router.get('/download-staff-csv', downloadStaffCSV);
router.post('/student-csv', upload.single('file'), uploadStudentCSV);
router.post('/staff-csv', upload.single('file'), uploadStaffCSV);
module.exports = router;