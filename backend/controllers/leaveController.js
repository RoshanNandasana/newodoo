const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// Apply for leave
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, attachment } = req.body;
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }
    
    // Calculate number of days (inclusive)
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Check leave balance
    const employee = await Employee.findById(req.employeeId);
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    const leaveTypeMap = {
      'PaidLeave': 'paidLeave',
      'SickLeave': 'sickLeave',
      'UnpaidLeave': 'unpaidLeave'
    };
    
    const balanceKey = leaveTypeMap[leaveType];
    
    // Check balance only for Paid and Sick leave
    if (leaveType !== 'UnpaidLeave') {
      if (!employee.leaveBalances || employee.leaveBalances[balanceKey] === undefined) {
        return res.status(400).json({ error: 'Leave balance not initialized' });
      }
      
      if (employee.leaveBalances[balanceKey] < numberOfDays) {
        return res.status(400).json({ 
          error: `Insufficient ${leaveType} balance. Available: ${employee.leaveBalances[balanceKey]} days, Requested: ${numberOfDays} days` 
        });
      }
    }
    
    const leave = new Leave({
      employee: req.employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      numberOfDays,
      reason,
      attachment
    });
    
    await leave.save();
    
    res.status(201).json({ message: 'Leave application submitted successfully', leave });
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
      return res.status(400).json({ error: 'Invalid status. Must be Approved or Rejected' });
    }
    
    const leave = await Leave.findById(id).populate('employee');
    
    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }
    
    if (leave.status !== 'Pending') {
      return res.status(400).json({ error: `Leave request already ${leave.status}` });
    }
    
    leave.status = status;
    leave.reviewedBy = req.userId;
    leave.reviewedAt = new Date();
    leave.reviewComments = reviewComments;
    
    await leave.save();
    
    // Update leave balance and attendance if approved
    if (status === 'Approved') {
      const employee = await Employee.findById(leave.employee._id);
      
      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      const leaveTypeMap = {
        'PaidLeave': 'paidLeave',
        'SickLeave': 'sickLeave',
        'UnpaidLeave': 'unpaidLeave'
      };
      
      const balanceKey = leaveTypeMap[leave.leaveType];
      
      // Deduct from leave balance (except unpaid leave)
      if (leave.leaveType !== 'UnpaidLeave') {
        if (!employee.leaveBalances) {
          employee.leaveBalances = { paidLeave: 20, sickLeave: 10, unpaidLeave: 0 };
        }
        employee.leaveBalances[balanceKey] = Math.max(0, employee.leaveBalances[balanceKey] - leave.numberOfDays);
        await employee.save();
      }
      
      // Mark attendance as OnLeave for each day in the leave period
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        
        // Create or update attendance record
        await Attendance.findOneAndUpdate(
          { employee: leave.employee._id, date },
          { 
            status: 'OnLeave',
            employee: leave.employee._id,
            date: date
          },
          { upsert: true, new: true }
        );
      }
    }
    
    res.json({ 
      message: `Leave request ${status.toLowerCase()} successfully`, 
      leave: await Leave.findById(leave._id)
        .populate('employee', 'firstName lastName email')
        .populate('reviewedBy', 'loginId')
    });
  } catch (error) {
    console.error('Error reviewing leave:', error);
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
