const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  workHours: {
    type: Number,
    default: 0
  },
  extraHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'OnLeave'],
    default: 'Absent'
  }
}, { timestamps: true });

// Calculate work hours before saving
attendanceSchema.pre('save', function(next) {
  // Set status to Present if checked in
  if (this.checkInTime && !this.checkOutTime) {
    this.status = 'Present';
  }
  
  // Calculate hours if both check-in and check-out exist
  if (this.checkInTime && this.checkOutTime) {
    const diff = this.checkOutTime - this.checkInTime;
    const hours = diff / (1000 * 60 * 60);
    this.workHours = Math.min(hours, 8); // Regular hours capped at 8
    this.extraHours = Math.max(0, hours - 8); // Extra hours
    this.status = 'Present';
  }
  
  next();
});

// Compound index to ensure one record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
