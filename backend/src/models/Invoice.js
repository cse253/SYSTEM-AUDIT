const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    hsnCode: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    unit: {
      type: String,
      default: 'packets',
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
    },
    taxableAmount: {
      type: Number,
      required: true,
    },
    gstPercentage: {
      type: Number,
      required: true,
      default: 5,
    },
    cgstRate: {
      type: Number,
      default: 0,
    },
    cgstAmount: {
      type: Number,
      default: 0,
    },
    sgstRate: {
      type: Number,
      default: 0,
    },
    sgstAmount: {
      type: Number,
      default: 0,
    },
    igstRate: {
      type: Number,
      default: 0,
    },
    igstAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalesOrder',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerGstin: {
      type: String,
      default: '',
    },
    customerAddress: {
      type: String,
      required: true,
    },
    customerState: {
      type: String,
      required: true,
    },
    customerStateCode: {
      type: String,
      required: true,
    },
    isInterState: {
      type: Boolean,
      default: false,
    },
    invoiceDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    items: [invoiceItemSchema],
    taxableAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    cgstTotal: {
      type: Number,
      default: 0,
    },
    sgstTotal: {
      type: Number,
      default: 0,
    },
    igstTotal: {
      type: Number,
      default: 0,
    },
    totalTax: {
      type: Number,
      required: true,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceDue: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Partially Paid', 'Paid'],
      default: 'Unpaid',
    },
    status: {
      type: String,
      enum: ['Active', 'Cancelled'],
      default: 'Active',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index({ invoiceNumber: 1, customer: 1, invoiceDate: -1, paymentStatus: 1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
