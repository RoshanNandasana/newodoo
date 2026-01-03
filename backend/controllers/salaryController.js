const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// Create or update salary structure (Admin only)
exports.createOrUpdateSalary = async (req, res) => {
  try {
    const { employeeId, baseWage, components, deductions } = req.body;
    
    let salary = await Salary.findOne({ employee: employeeId });
    
    if (salary) {
      // Update existing salary
      salary.baseWage = baseWage;
      if (components) salary.components = { ...salary.components, ...components };
      if (deductions) salary.deductions = { ...salary.deductions, ...deductions };
    } else {
      // Create new salary
      salary = new Salary({
        employee: employeeId,
        baseWage,
        components,
        deductions
      });
    }
    
    await salary.save();
    
    res.json({ message: 'Salary structure saved', salary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get salary by employee ID (Admin or own salary)
exports.getSalary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    // Check if user is viewing their own salary or is Admin/HR
    if (req.employeeId.toString() !== employeeId && req.user.role === 'Employee') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const salary = await Salary.findOne({ employee: employeeId })
      .populate('employee', 'firstName lastName email');
    
    if (!salary) {
      return res.status(404).json({ error: 'Salary structure not found' });
    }
    
    res.json(salary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all salaries (Admin only)
exports.getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate('employee', 'firstName lastName email department');
    
    res.json(salaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Calculate payroll for a month (Admin only)
exports.calculatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;
    
    const salary = await Salary.findOne({ employee: employeeId });
    
    if (!salary) {
      return res.status(404).json({ error: 'Salary structure not found' });
    }
    
    // Get attendance for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const attendance = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate },
      status: { $in: ['Present', 'OnLeave'] }
    });
    
    const workingDays = endDate.getDate();
    const presentDays = attendance.length;
    const payableRatio = presentDays / workingDays;
    
    const payableSalary = salary.monthlySalary * payableRatio;
    
    const payroll = {
      employee: employeeId,
      month,
      year,
      totalDays: workingDays,
      presentDays,
      payableRatio,
      baseSalary: salary.monthlySalary,
      payableSalary: Math.round(payableSalary * 100) / 100,
      components: salary.components,
      deductions: salary.deductions
    };
    
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete salary structure (Admin only)
exports.deleteSalary = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const salary = await Salary.findOneAndDelete({ employee: employeeId });
    
    if (!salary) {
      return res.status(404).json({ error: 'Salary structure not found' });
    }
    
    res.json({ message: 'Salary structure deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
