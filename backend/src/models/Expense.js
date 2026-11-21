const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    expenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['LABOUR', 'GAS_POWER', 'MAINTENANCE', 'PACKAGING_EXTRA', 'TRANSPORT', 'OTHER'],
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0, 'Expense amount cannot be negative'],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    productionRun: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductionRun',
    },
    expenseDate: {
      type: Date,
      default: Date.now,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ category: 1, expenseDate: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
