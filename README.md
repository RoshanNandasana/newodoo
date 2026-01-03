# Dayflow - Human Resource Management System

A comprehensive HRMS built with the MERN stack (MongoDB, Express, React, Node.js) featuring modern UI/UX design and complete HR management capabilities.

## 🚀 Features

### Employee Management
- Create and manage employee profiles with comprehensive details
- Upload profile pictures
- Track personal, address, and bank information
- Department and position management
- Employee directory with search and filter
- Auto-generated login IDs (Format: OIJDOD{Initials}{Year}{SerialNumber})

### Attendance System
- Real-time attendance tracking
- Mark check-in/check-out with timestamps
- Interactive status indicators (Red/Yellow/Green/Airplane)
- Attendance history and reports
- Dashboard overview with attendance status
- Admin/HR attendance management
- Work hours and extra hours calculation

### Leave Management
- Apply for different leave types (Paid, Sick, Unpaid)
- Leave balance tracking
- Leave approval workflow
- Attachment support for medical certificates
- Complete leave history with status tracking
- Admin/HR review and approval system
- Automatic balance updates

### Salary Management
- Configurable salary structures
- Multiple salary components (Basic, HRA, Allowances, Bonuses)
- Flexible percentage-based or fixed amount calculations
- Automatic deductions (PF, Professional Tax)
- Annual and monthly salary calculations
- Detailed salary breakdowns
- Salary history tracking

### User Authentication & Security
- JWT-based authentication
- Role-based access control (Admin, HR, Employee)
- Secure password management
- First-time login password change enforcement
- Protected routes and API endpoints

### Modern UI/UX
- Clean, professional design with #714B67 (Dayflow burgundy) branding
- Responsive layout for all screen sizes
- Material-UI components with custom styling
- Interactive dashboards and data visualizations
- Smooth animations and transitions
- Intuitive navigation and user experience

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **Material-UI (MUI) v5** - Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
npm install
```

2. Create `.env` file in backend directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hrms
JWT_SECRET=your_jwt_secret_key_here_min_32_characters
COMPANY_CODE=OIJDOD
```

3. Create admin user:
```bash
node createAdmin.js
```

Default Admin Credentials:
- Login ID: `ADMIN001`
- Password: `Admin@123`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
npm install
```

2. Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend Application
```bash
cd frontend
npm start
# Application runs on http://localhost:3000
```

## 📖 Usage Guide

1. **Initial Setup**
   - Access the application at `http://localhost:3000`
   - Login with admin credentials (ADMIN001 / Admin@123)
   - Change password on first login (enforced)

2. **Employee Management**
   - Click "Add Employee" button in Dashboard
   - Fill in employee details (personal, address, bank info)
   - Upload profile picture (optional)
   - System auto-generates login credentials
   - Provide credentials to employee

3. **Attendance Tracking**
   - Click attendance circle in navbar
   - Select status (Red/Yellow/Green/Airplane)
   - Check-in at start of day
   - Check-out at end of day
   - View attendance history in Attendance page

4. **Leave Application**
   - Navigate to Leave page
   - Click "Apply for Leave"
   - Select leave type and date range
   - Attach medical certificate if applicable
   - Submit for approval
   - Track leave status

5. **Salary Management** (Admin/HR only)
   - Navigate to Salary page
   - Select employee
   - Configure salary components
   - Toggle between percentage/fixed amounts
   - View salary breakdown
   - System calculates gross and net salary

## 🏗️ Project Structure

```
human/
├── backend/
│   ├── controllers/           # Request handlers
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── attendanceController.js
│   │   ├── leaveController.js
│   │   └── salaryController.js
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js           # JWT verification
│   │   └── upload.js         # Multer configuration
│   ├── models/                # Mongoose schemas
│   │   ├── User.js
│   │   ├── Employee.js
│   │   ├── Attendance.js
│   │   ├── Leave.js
│   │   └── Salary.js
│   ├── routes/                # API routes
│   ├── utils/                 # Helper functions
│   ├── uploads/               # Uploaded files
│   ├── server.js              # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Navbar.js
│   │   │   ├── EmployeeCard.js
│   │   │   └── ProtectedRoute.js
│   │   ├── pages/             # Page components
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Profile.js
│   │   │   ├── Attendance.js
│   │   │   ├── Leave.js
│   │   │   ├── Salary.js
│   │   │   └── CreateEmployee.js
│   │   ├── context/           # React context
│   │   │   └── AuthContext.js
│   │   ├── services/          # API services
│   │   │   └── api.js
│   │   ├── utils/             # Utility functions
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   └── package.json
└── README.md
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for passwords
- **Role-Based Access**: Three-tier access control (Admin, HR, Employee)
- **Protected Routes**: Frontend and backend route protection
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Type and size restrictions on uploads
- **First Login Security**: Mandatory password change on first login

## 🎨 Design System

- **Primary Color**: #714B67 (Dayflow burgundy)
- **Accent Color**: #C895C6 (Light purple)
- **Background**: #f8f9fa (Light gray)
- **Border Radius**: 8-12px for cards and inputs
- **Shadows**: Soft material design shadows
- **Typography**: Roboto font family
- **Spacing**: 8px base unit for consistent spacing
- **Responsive Breakpoints**: 
  - xs: 0-600px (Mobile)
  - md: 600-960px (Tablet)
  - lg: 960px+ (Desktop)

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/create-employee` - Create employee

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/with-status` - Get employees with attendance status
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
- `GET /api/leave/balance` - Get leave balance
- `PUT /api/leave/:id/approve` - Approve leave
- `PUT /api/leave/:id/reject` - Reject leave

### Salary
- `POST /api/salary` - Create/update salary structure
- `GET /api/salary/:employeeId` - Get employee salary
- `PUT /api/salary/:id` - Update salary structure

### File Uploads
- `POST /api/upload/profile` - Upload profile picture
- `POST /api/upload/leave-attachment` - Upload leave document

## 🚀 Deployment

### Backend Deployment (Heroku/Render)

1. Create account on Heroku or Render
2. Install Heroku CLI (if using Heroku)
3. Deploy backend:
```bash
cd backend
heroku login
heroku create your-hrms-backend
git init
git add .
git commit -m "Initial backend deployment"
heroku git:remote -a your-hrms-backend
git push heroku main
```

4. Set environment variables:
```bash
heroku config:set MONGO_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set COMPANY_CODE=OIJDOD
```

### Frontend Deployment (Vercel/Netlify)

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Deploy to Vercel:
```bash
npm install -g vercel
vercel login
vercel --prod
```

3. Or deploy to Netlify:
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=build
```

4. Update `.env` with production backend URL:
```env
REACT_APP_API_URL=https://your-hrms-backend.herokuapp.com/api
```

### MongoDB Atlas Setup

1. Create MongoDB Atlas account
2. Create new cluster
3. Add database user
4. Whitelist IP addresses (0.0.0.0/0 for all)
5. Get connection string
6. Update MONGO_URI in environment variables

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is open source and available for educational and commercial use.

## 👥 Authors

- **Namra Gajera** - Initial development and backend architecture
- **Ihit Joshi** - UI/UX redesign and frontend enhancements

## 🙏 Acknowledgments

- Material-UI for the excellent component library
- MongoDB for the flexible database solution
- The MERN stack community for inspiration and support

## 📧 Contact

For questions or support, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ using the MERN Stack**
