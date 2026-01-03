const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authMiddleware } = require('../middleware/auth');

// Upload profile picture
router.post('/profile-picture', authMiddleware, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const Employee = require('../models/Employee');
    const employee = await Employee.findByIdAndUpdate(
      req.employeeId,
      { profilePicture: `/uploads/${req.file.filename}` },
      { new: true }
    );
    
    res.json({ message: 'Profile picture uploaded', url: employee.profilePicture });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload resume
router.post('/resume', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const Employee = require('../models/Employee');
    const employee = await Employee.findByIdAndUpdate(
      req.employeeId,
      { resume: `/uploads/${req.file.filename}` },
      { new: true }
    );
    
    res.json({ message: 'Resume uploaded', url: employee.resume });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload leave attachment
router.post('/leave-attachment', authMiddleware, upload.single('attachment'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({ message: 'Attachment uploaded', url: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
