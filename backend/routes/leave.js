const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authMiddleware, isAdminOrHR } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Employee routes
router.post('/apply', leaveController.applyLeave);
router.get('/my-leaves', leaveController.getMyLeaves);
router.get('/balance', leaveController.getLeaveBalance);

// Admin/HR routes
router.get('/all', isAdminOrHR, leaveController.getAllLeaves);
router.put('/:id/review', isAdminOrHR, leaveController.reviewLeave);

module.exports = router;
