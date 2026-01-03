// Script to create the first Admin user
const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hrms');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'Admin' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Login ID:', existingAdmin.loginId);
      process.exit(0);
    }

    // Create admin employee
    const adminEmployee = new Employee({
      firstName: 'Admin',
      lastName: 'User',
      initials: 'AU',
      email: 'admin@hrms.com',
      phone: '1234567890',
      company: process.env.COMPANY_CODE || 'OIJDOD',
      department: 'Administration',
      position: 'System Administrator',
      dateOfJoining: new Date(),
      serialNumber: 1
    });

    await adminEmployee.save();
    console.log('Admin employee created');

    // Create admin user account
    const adminUser = new User({
      loginId: 'ADMIN001',
      password: 'Admin@123', // Default password - MUST BE CHANGED
      role: 'Admin',
      isFirstLogin: true,
      employee: adminEmployee._id
    });

    await adminUser.save();
    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Login ID: ADMIN001');
    console.log('Password: Admin@123');
    console.log('\n⚠️  IMPORTANT: You will be required to change the password on first login\n');

    // Update employee with user reference
    adminEmployee.user = adminUser._id;
    await adminEmployee.save();

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
