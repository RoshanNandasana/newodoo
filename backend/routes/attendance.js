const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware, isAdminOrHR } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Employee routes
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/my-attendance', attendanceController.getMyAttendance);

// Admin/HR routes
router.get('/all', isAdminOrHR, attendanceController.getAllAttendance);
router.get('/summary/:employeeId?', attendanceController.getAttendanceSummary);

module.exports = router;
