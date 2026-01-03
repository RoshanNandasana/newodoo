const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('employee');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    req.user = user;
    req.userId = user._id;
    req.employeeId = user.employee?._id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Check if user is Admin or HR
const isAdminOrHR = (req, res, next) => {
  if (req.user.role === 'Admin' || req.user.role === 'HR') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin or HR role required.' });
  }
};

// Check if user is Admin only
const isAdmin = (req, res, next) => {
  if (req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
};

module.exports = { authMiddleware, isAdminOrHR, isAdmin };
