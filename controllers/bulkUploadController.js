const User = require('../models/User');
const Organization = require('../models/Organization');
const Staff = require('../models/Staff');
const Student = require('../models/Student');
const fs = require("fs");
const csv = require("csv-parser");
const streamifier = require("streamifier");

const downloadStudentCSV = async (req, res) => {
  try {

    const base_url = `${req.protocol}://${req.get("host")}/`;

    res.status(200).json({
      success: true,
      message: "CSV file available",
      url: base_url + "uploads/student_template.csv"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const downloadStaffCSV = async (req, res) => {
  try {

    const base_url = `${req.protocol}://${req.get("host")}/`;

    res.status(200).json({
      success: true,
      message: "CSV file available",
      url: base_url + "uploads/staff_template.csv"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const uploadStudentCSV = async (req, res) => {

  try {

    const results = [];

    streamifier.createReadStream(req.file.buffer)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {

        let inserted = 0;
        let duplicateStudents = 0;
        let duplicateMobile = 0;
        let invalidOrganization = 0;

        for (let row of results) {

          const {
            organizationId,
            name,
            fatherName,
            class: studentClass,
            section,
            session,
            mobileNumber
          } = row;

          // check organization
          const organization = await Organization.findById(organizationId);

          if (!organization) {
            invalidOrganization++;
            continue;
          }

          // check duplicate student
          const existingStudent = await Student.findOne({
            organization: organizationId,
            name,
            fatherName
          });

          if (existingStudent) {
            duplicateStudents++;
            continue;
          }

          // check duplicate mobile
          const existingMobile = await Student.findOne({ mobileNumber });

          if (existingMobile) {
            duplicateMobile++;
            continue;
          }

          await Student.create({
            organization: organizationId,
            name,
            fatherName,
            class: studentClass,
            section,
            session,
            mobileNumber
          });

          inserted++;
        }

        res.json({
          success: true,
          message: "Student CSV processed",
          inserted,
          duplicateStudents,
          duplicateMobile,
          invalidOrganization
        });

      });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};


const uploadStaffCSV = async (req, res) => {

  try {

    const results = [];

    streamifier.createReadStream(req.file.buffer)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {

        let inserted = 0;
        let duplicateMobile = 0;
        let duplicateEmail = 0;
        let invalidOrganization = 0;

        for (let row of results) {

          const {
            org_id,
            mobile_no,
            email,
            fName,
            department,
            designation
          } = row;

          const organization = await Organization.findById(org_id);

          if (!organization) {
            invalidOrganization++;
            continue;
          }

          const existingMobile = await Staff.findOne({ mobile_no });

          if (existingMobile) {
            duplicateMobile++;
            continue;
          }

          const existingEmail = await Staff.findOne({
            email: email.toLowerCase().trim()
          });

          if (existingEmail) {
            duplicateEmail++;
            continue;
          }

          await Staff.create({
            organization: org_id,
            mobile_no,
            email: email.toLowerCase().trim(),
            fName,
            department,
            designation
          });

          inserted++;
        }

        res.json({
          success: true,
          message: "Staff CSV processed",
          inserted,
          duplicateMobile,
          duplicateEmail,
          invalidOrganization
        });

      });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

module.exports = {
  downloadStudentCSV,
  downloadStaffCSV,
  uploadStudentCSV,
  uploadStaffCSV
};