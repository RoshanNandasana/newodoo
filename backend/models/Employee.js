const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  // Basic Info
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  initials: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  nationality: { type: String },
  
  // Company Info
  company: { type: String, default: 'OIJDOD' },
  department: { type: String },
  position: { type: String },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  dateOfJoining: { type: Date, required: true },
  serialNumber: { type: Number, required: true },
  
  // Address
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  
  // Bank Details
  bankDetails: {
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    pan: String,
    uan: String
  },
  
  // Profile
  profilePicture: { type: String, default: '' },
  resume: { type: String },
  
  // Leave Balances
  leaveBalances: {
    paidLeave: { type: Number, default: 20 },
    sickLeave: { type: Number, default: 10 },
    unpaidLeave: { type: Number, default: 0 }
  },
  
  // Status
  isActive: { type: Boolean, default: true },
  
  // Related User
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Employee', employeeSchema);
