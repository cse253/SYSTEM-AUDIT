const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    invoiceNumber: {
      type: String,
      default: '',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment amount must be greater than zero'],
    },
    paymentMode: {
      type: String,
      required: true,
      enum: ['CASH', 'NEFT', 'RTGS', 'UPI', 'CHEQUE', 'BANK_TRANSFER'],
      default: 'NEFT',
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: '',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ customer: 1, paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
