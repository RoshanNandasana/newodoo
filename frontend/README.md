# HRMS Frontend

A modern, clean, professional React frontend for the Human Resource Management System (HRMS).

## Features

### Authentication & Access Control
- Login and password change UI
- Role-based access (Admin, HR, Employee)
- Auto-generated login IDs and temporary passwords
- Forced password change on first login

### Dashboard
- Employee cards in grid layout
- Profile pictures
- Real-time attendance status indicators (Present/On Leave/Absent)
- Clickable cards to view employee profiles

### Profile Management
- Tabbed layout: Resume, Private Info, Salary Info, Security
- Profile picture upload
- Comprehensive employee information display
- Salary information (visible to Admin/HR and own profile)

### Attendance Management
- Check-in/Check-out functionality
- Real-time work hours and extra hours tracking
- Monthly attendance summary
- Admin/HR can view all employee attendance

### Leave Management
- Apply for leave with date selection
- Leave types: Paid, Sick, Unpaid
- Attachment upload for medical certificates
- Leave balance tracking
- Admin/HR can approve/reject leave requests

### Salary Management (Admin Only)
- Configure salary structures
- Salary components (Basic, HRA, Allowances, etc.)
- Automatic calculations
- Deductions (PF, Professional Tax)
- Monthly and annual salary display

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

3. Run the development server:
```bash
npm start
```

4. Build for production:
```bash
npm run build
```

## Technologies Used

- React 18
- Material-UI (MUI) for UI components
- React Router for navigation
- Axios for API calls
- Context API for state management

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── EmployeeCard.js
│   │   ├── Navbar.js
│   │   └── ProtectedRoute.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Attendance.js
│   │   ├── ChangePassword.js
│   │   ├── CreateEmployee.js
│   │   ├── Dashboard.js
│   │   ├── Leave.js
│   │   ├── Login.js
│   │   ├── Profile.js
│   │   └── Salary.js
│   ├── services/
│   │   └── api.js
│   ├── App.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

## API Integration

All API calls are centralized in `services/api.js` with the following modules:
- Authentication API
- Employee API
- Attendance API
- Leave API
- Salary API
- Upload API

## Role-Based Features

### Admin
- Full access to all features
- Create employees
- Manage salaries
- Approve/reject leaves
- View all attendance records

### HR
- Create employees
- Approve/reject leaves
- View all employee information
- View all attendance records

### Employee
- View own profile
- Check-in/check-out
- Apply for leave
- View own attendance and leave records

## Security

- JWT token-based authentication
- Protected routes with role-based access control
- Secure API communication
- Password change enforcement on first login

## License

MIT
