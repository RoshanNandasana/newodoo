const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// Check-in
exports.checkIn = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if already checked in today
    let attendance = await Attendance.findOne({
      employee: req.employeeId,
      date: today
    });
    
    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ error: 'Already checked in today' });
    }
    
    if (!attendance) {
      attendance = new Attendance({
        employee: req.employeeId,
        date: today
      });
    }
    
    attendance.checkInTime = new Date();
    await attendance.save();
    
    res.json({ message: 'Checked in successfully', attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check-out
exports.checkOut = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const attendance = await Attendance.findOne({
      employee: req.employeeId,
      date: today
    });
    
    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ error: 'Must check in first' });
    }
    
    if (attendance.checkOutTime) {
      return res.status(400).json({ error: 'Already checked out today' });
    }
    
    attendance.checkOutTime = new Date();
    await attendance.save();
    
    res.json({ message: 'Checked out successfully', attendance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get my attendance
exports.getMyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let query = { employee: req.employeeId };
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const attendance = await Attendance.find(query).sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all attendance (Admin/HR)
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    
    let query = {};
    
    if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      query.date = targetDate;
    }
    
    if (employeeId) {
      query.employee = employeeId;
    }
    
    const attendance = await Attendance.find(query)
      .populate('employee', 'firstName lastName email')
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get attendance summary
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const employeeId = req.params.employeeId || req.employeeId;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const attendance = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate }
    });
    
    const summary = {
      totalDays: endDate.getDate(),
      presentDays: attendance.filter(a => a.status === 'Present').length,
      absentDays: attendance.filter(a => a.status === 'Absent').length,
      leaveDays: attendance.filter(a => a.status === 'OnLeave').length,
      totalWorkHours: attendance.reduce((sum, a) => sum + a.workHours, 0),
      totalExtraHours: attendance.reduce((sum, a) => sum + a.extraHours, 0)
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
