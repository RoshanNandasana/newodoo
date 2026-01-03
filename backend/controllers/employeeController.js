const Employee = require('../models/Employee');
const Salary = require('../models/Salary');

// Get all employees (Admin/HR)
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true })
      .populate('manager', 'firstName lastName')
      .populate('user', 'loginId role');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('manager', 'firstName lastName')
      .populate('user', 'loginId role');
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update employee profile
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is updating their own profile or is Admin/HR
    if (req.employeeId.toString() !== id && req.user.role === 'Employee') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const employee = await Employee.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete employee (Admin only)
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get employee with attendance status
exports.getEmployeesWithStatus = async (req, res) => {
  try {
    const Attendance = require('../models/Attendance');
    const Leave = require('../models/Leave');
    const employees = await Employee.find({ isActive: true })
      .populate('user', 'loginId role');
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const employeesWithStatus = await Promise.all(
      employees.map(async (emp) => {
        // Check if employee has approved leave today
        const leave = await Leave.findOne({
          employee: emp._id,
          status: 'Approved',
          startDate: { $lte: today },
          endDate: { $gte: today }
        });
        
        if (leave) {
          return {
            ...emp.toObject(),
            attendanceStatus: 'OnLeave'
          };
        }
        
        // Check attendance record
        const attendance = await Attendance.findOne({
          employee: emp._id,
          date: today
        });
        
        let status = 'NotCheckedIn'; // Default status
        
        if (attendance) {
          if (attendance.checkInTime) {
            status = 'Present';
          } else if (attendance.status === 'Absent') {
            status = 'Absent';
          } else {
            status = attendance.status;
          }
        }
        
        return {
          ...emp.toObject(),
          attendanceStatus: status
        };
      })
    );
    
    res.json(employeesWithStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
