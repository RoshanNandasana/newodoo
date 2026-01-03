const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, isAdminOrHR } = require('../middleware/auth');

// Public routes
router.post('/login', authController.login);

// Protected routes
router.post('/change-password', authMiddleware, authController.changePassword);
router.get('/profile', authMiddleware, authController.getProfile);

// Admin/HR only
router.post('/create-employee', authMiddleware, isAdminOrHR, authController.createEmployee);

module.exports = router;
