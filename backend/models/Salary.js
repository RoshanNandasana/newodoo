const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
    unique: true
  },
  baseWage: {
    type: Number,
    required: true,
    min: 0
  },
  components: {
    basic: {
      value: { type: Number, default: 0 },
      isPercentage: { type: Boolean, default: true },
      percentage: { type: Number, default: 40 } // 40% of base
    },
    hra: {
      value: { type: Number, default: 0 },
      isPercentage: { type: Boolean, default: true },
      percentage: { type: Number, default: 20 } // 20% of base
    },
    standardAllowance: {
      value: { type: Number, default: 0 },
      isPercentage: { type: Boolean, default: true },
      percentage: { type: Number, default: 10 }
    },
    performanceBonus: {
      value: { type: Number, default: 0 },
      isPercentage: { type: Boolean, default: false }
    },
    leaveTravelAllowance: {
      value: { type: Number, default: 0 },
      isPercentage: { type: Boolean, default: true },
      percentage: { type: Number, default: 5 }
    },
    fixedAllowance: {
      value: { type: Number, default: 0 },
      isPercentage: { type: Boolean, default: false }
    }
  },
  deductions: {
    providentFund: {
      value: { type: Number, default: 0 },
      isPercentage: { type: Boolean, default: true },
      percentage: { type: Number, default: 12 } // 12% of basic
    },
    professionalTax: {
      value: { type: Number, default: 0 },
      isPercentage: { type: Boolean, default: false }
    }
  },
  totalSalary: {
    type: Number,
    default: 0
  },
  monthlySalary: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Calculate salary components before saving
salarySchema.pre('save', function(next) {
  const { baseWage, components, deductions } = this;
  
  // Calculate component values
  Object.keys(components).forEach(key => {
    const component = components[key];
    if (component.isPercentage) {
      component.value = (baseWage * component.percentage) / 100;
    }
  });
  
  // Calculate basic for deductions
  const basicSalary = components.basic.value;
  
  // Calculate deduction values
  Object.keys(deductions).forEach(key => {
    const deduction = deductions[key];
    if (deduction.isPercentage) {
      deduction.value = (basicSalary * deduction.percentage) / 100;
    }
  });
  
  // Calculate total salary
  const totalComponents = Object.values(components).reduce((sum, comp) => sum + comp.value, 0);
  const totalDeductions = Object.values(deductions).reduce((sum, ded) => sum + ded.value, 0);
  
  this.totalSalary = totalComponents - totalDeductions;
  this.monthlySalary = this.totalSalary / 12;
  
  next();
});

module.exports = mongoose.model('Salary', salarySchema);
