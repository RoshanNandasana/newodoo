const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, attachment } = req.body;
    
    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Check leave balance
    const employee = await Employee.findById(req.employeeId);
    const leaveTypeMap = {
      'PaidLeave': 'paidLeave',
      'SickLeave': 'sickLeave',
      'UnpaidLeave': 'unpaidLeave'
    };
    
    const balanceKey = leaveTypeMap[leaveType];
    if (leaveType !== 'UnpaidLeave' && employee.leaveBalances[balanceKey] < numberOfDays) {
      return res.status(400).json({ error: 'Insufficient leave balance' });
    }
    
    const leave = new Leave({
      employee: req.employeeId,
      leaveType,
      startDate,
      endDate,
      numberOfDays,
      reason,
      attachment
    });
    
    await leave.save();
    
    res.status(201).json({ message: 'Leave application submitted', leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get my leaves
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.employeeId })
      .populate('reviewedBy', 'loginId')
      .sort({ createdAt: -1 });
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all leave requests (Admin/HR)
exports.getAllLeaves = async (req, res) => {
  try {
    const { status, employeeId } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (employeeId) query.employee = employeeId;
    
    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName email')
      .populate('reviewedBy', 'loginId')
      .sort({ createdAt: -1 });
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve or reject leave (Admin/HR)
exports.reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewComments } = req.body;
    
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const leave = await Leave.findById(id).populate('employee');
    
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    if (leave.status !== 'Pending') {
      return res.status(400).json({ error: 'Leave request already reviewed' });
    }
    
    leave.status = status;
    leave.reviewedBy = req.userId;
    leave.reviewedAt = new Date();
    leave.reviewComments = reviewComments;
    
    await leave.save();
    
    // Update leave balance and attendance if approved
    if (status === 'Approved') {
      const employee = await Employee.findById(leave.employee._id);
      
      const leaveTypeMap = {
        'PaidLeave': 'paidLeave',
        'SickLeave': 'sickLeave',
        'UnpaidLeave': 'unpaidLeave'
      };
      
      const balanceKey = leaveTypeMap[leave.leaveType];
      if (leaveType !== 'UnpaidLeave') {
        employee.leaveBalances[balanceKey] -= leave.numberOfDays;
        await employee.save();
      }
      
      // Mark attendance as on leave
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        
        await Attendance.findOneAndUpdate(
          { employee: leave.employee._id, date },
          { status: 'OnLeave' },
          { upsert: true }
        );
      }
    }
    
    res.json({ message: `Leave request ${status.toLowerCase()}`, leave });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get leave balance
exports.getLeaveBalance = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employeeId);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(employee.leaveBalances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
