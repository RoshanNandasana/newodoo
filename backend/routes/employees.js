const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authMiddleware, isAdminOrHR, isAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get all employees with attendance status
router.get('/status', employeeController.getEmployeesWithStatus);

// Get all employees (Admin/HR)
router.get('/', isAdminOrHR, employeeController.getAllEmployees);

// Get employee by ID
router.get('/:id', employeeController.getEmployeeById);

// Update employee
router.put('/:id', employeeController.updateEmployee);

// Delete employee (Admin only)
router.delete('/:id', isAdmin, employeeController.deleteEmployee);

module.exports = router;
