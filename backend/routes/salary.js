const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const { authMiddleware, isAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get salary (own or as Admin)
router.get('/:employeeId', salaryController.getSalary);

// Admin only routes
router.post('/', isAdmin, salaryController.createOrUpdateSalary);
router.get('/', isAdmin, salaryController.getAllSalaries);
router.post('/payroll', isAdmin, salaryController.calculatePayroll);
router.delete('/:employeeId', isAdmin, salaryController.deleteSalary);

module.exports = router;
