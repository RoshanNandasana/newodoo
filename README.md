# Human Resource Management System (HRMS)

A comprehensive MERN stack HRMS web application with role-based access control, attendance tracking, leave management, and salary processing.

## Features

### Authentication & Authorization
- Auto-generated login IDs (Format: OIJDOD{Initials}{Year}{SerialNumber})
- Role-based access (Admin, HR Officer, Employee)
- Secure JWT authentication
- Forced password change on first login

### Employee Management
- Create and manage employee profiles
- Profile picture and resume uploads
- Personal and company information
- Bank details and contact information
- Role-based data visibility

### Attendance System
- Interactive check-in/check-out functionality
- Real-time status indicators (Red/Yellow/Green/Airplane)
- Day-wise attendance view (Admin/HR)
- Month-wise attendance view (Employees)
- Work hours and extra hours calculation
- Attendance summary statistics

### Leave Management
- Leave application with file attachments
- Approval/rejection workflow
- Leave balance tracking (Paid, Sick, Unpaid)
- Leave history and status
- Automatic balance updates

### Salary Management
- Configurable salary components (Percentage/Fixed)
- Automatic gross and net salary calculation
- Monthly payroll generation
- Salary history tracking

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT authentication
- Multer for file uploads
- bcrypt for password hashing

### Frontend
- React 18
- Material-UI (MUI)
- React Router
- Axios
- Context API

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your_jwt_secret_key_here
COMPANY_CODE=OIJDOD
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

### Start Backend
```bash
cd backend
npm run dev
```

### Start Frontend
```bash
cd frontend
npm start
```

### Create Admin User
```bash
cd backend
node createAdmin.js
```

Default Admin Credentials:
- Login ID: `ADMIN001`
- Password: `Admin@123`

## Usage

1. Access the application at `http://localhost:3000`
2. Login with admin credentials
3. Change password on first login
4. Create employees from "Add Employee" button
5. Employees receive auto-generated login credentials
6. Use attendance circle in navbar for check-in/check-out
7. Manage leaves, view salary, and track attendance

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/create-employee` - Create new employee

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/with-status` - Get employees with status
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance
- `POST /api/attendance/check-in` - Check in
- `POST /api/attendance/check-out` - Check out
- `GET /api/attendance/my` - Get my attendance
- `GET /api/attendance` - Get all attendance (Admin/HR)
- `GET /api/attendance/summary/:employeeId?` - Get attendance summary

### Leave
- `POST /api/leave` - Apply for leave
- `GET /api/leave/my` - Get my leaves
- `GET /api/leave` - Get all leaves (Admin/HR)
- `PUT /api/leave/:id/approve` - Approve leave
- `PUT /api/leave/:id/reject` - Reject leave

### Salary
- `POST /api/salary` - Create salary structure
- `GET /api/salary/:employeeId` - Get employee salary
- `PUT /api/salary/:id` - Update salary

## Project Structure

```
human/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   └── createAdmin.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── utils/
│       └── App.js
└── README.md
```

## License

MIT

## Author

Developed as a comprehensive HRMS solution
