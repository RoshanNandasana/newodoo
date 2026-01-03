# HRMS Backend API

A complete Human Resource Management System (HRMS) backend built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Access Control**
  - JWT-based authentication
  - Role-based access (Admin, HR, Employee)
  - Auto-generated login IDs and temporary passwords
  - Forced password change on first login

- **Employee Management**
  - Create, read, update, and deactivate employees
  - Profile management with tabs (Resume, Private Info, Salary, Security)
  - Profile picture and resume upload

- **Attendance Management**
  - Check-in/check-out functionality
  - Attendance tracking and summaries
  - Admin/HR attendance reports

- **Leave Management**
  - Leave application with attachment support
  - Leave approval/rejection workflow
  - Auto-updating leave balances
  - Leave types: Paid, Sick, Unpaid

- **Salary Management**
  - Configurable salary components
  - Automatic salary calculations
  - Payroll computation based on attendance
  - Deductions (PF, Professional Tax)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your_jwt_secret_key_here
COMPANY_CODE=OIJDOD
```

3. Start MongoDB service

4. Run the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/create-employee` - Create employee (Admin/HR)
- `GET /api/auth/profile` - Get current user profile

### Employees
- `GET /api/employees` - Get all employees (Admin/HR)
- `GET /api/employees/status` - Get employees with attendance status
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Deactivate employee (Admin)

### Attendance
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/my-attendance` - Get my attendance
- `GET /api/attendance/all` - Get all attendance (Admin/HR)
- `GET /api/attendance/summary/:employeeId?` - Get attendance summary

### Leave
- `POST /api/leave/apply` - Apply for leave
- `GET /api/leave/my-leaves` - Get my leaves
- `GET /api/leave/balance` - Get leave balance
- `GET /api/leave/all` - Get all leaves (Admin/HR)
- `PUT /api/leave/:id/review` - Review leave (Admin/HR)

### Salary
- `POST /api/salary` - Create/update salary (Admin)
- `GET /api/salary/:employeeId` - Get salary
- `GET /api/salary` - Get all salaries (Admin)
- `POST /api/salary/payroll` - Calculate payroll (Admin)
- `DELETE /api/salary/:employeeId` - Delete salary (Admin)

### Upload
- `POST /api/upload/profile-picture` - Upload profile picture
- `POST /api/upload/resume` - Upload resume
- `POST /api/upload/leave-attachment` - Upload leave attachment

## Database Models

- **User** - Authentication and login credentials
- **Employee** - Employee personal and professional information
- **Attendance** - Daily attendance records
- **Leave** - Leave applications and approvals
- **Salary** - Salary structure and components

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for session management
- Role-based access control middleware
- Input validation and sanitization

## License

MIT
