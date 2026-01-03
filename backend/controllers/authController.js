const User = require('../models/User');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const { generateLoginId, generateTempPassword } = require('../utils/generateCredentials');

// Login
exports.login = async (req, res) => {
  try {
    const { loginId, password } = req.body;
    
    console.log('Login attempt:', { loginId, passwordLength: password?.length });
    
    const user = await User.findOne({ loginId }).populate('employee');
    if (!user) {
      console.log('User not found:', loginId);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('User found:', { id: user._id, role: user.role });
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password mismatch for user:', loginId);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log('Login successful for:', loginId);
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id: user._id,
        loginId: user.loginId,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        employee: user.employee
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Change password (for first login or regular password change)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    user.password = newPassword;
    user.isFirstLogin = false;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create employee (Admin/HR only)
exports.createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      nationality,
      department,
      position,
      manager,
      dateOfJoining,
      address,
      bankDetails
    } = req.body;
    
    // Generate initials
    const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    
    // Get year of joining
    const yearOfJoining = new Date(dateOfJoining).getFullYear();
    
    // Get next serial number
    const lastEmployee = await Employee.findOne().sort({ serialNumber: -1 });
    const serialNumber = lastEmployee ? lastEmployee.serialNumber + 1 : 1;
    
    // Create employee
    const employee = new Employee({
      firstName,
      lastName,
      initials,
      email,
      phone,
      dateOfBirth,
      gender,
      nationality,
      department,
      position,
      manager,
      dateOfJoining,
      serialNumber,
      address,
      bankDetails
    });
    
    await employee.save();
    
    // Generate login credentials
    const companyCode = process.env.COMPANY_CODE || 'OIJDOD';
    const loginId = generateLoginId(companyCode, initials, yearOfJoining, serialNumber);
    const tempPassword = generateTempPassword();
    
    // Create user account
    const user = new User({
      loginId,
      password: tempPassword,
      role: 'Employee',
      employee: employee._id
    });
    
    await user.save();
    
    // Update employee with user reference
    employee.user = user._id;
    await employee.save();
    
    res.status(201).json({
      message: 'Employee created successfully',
      employee,
      credentials: {
        loginId,
        tempPassword
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('employee');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
