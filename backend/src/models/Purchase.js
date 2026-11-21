const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      required: true,
      enum: ['RawMaterial', 'PackagingMaterial'],
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'items.itemType',
    },
    itemName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.001, 'Quantity must be positive'],
    },
    unit: {
      type: String,
      required: true,
    },
    unitRate: {
      type: Number,
      required: true,
      min: [0, 'Unit rate cannot be negative'],
    },
    gstPercentage: {
      type: Number,
      default: 5,
    },
    taxableAmount: {
      type: Number,
      required: true,
    },
    gstAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    batchNumber: {
      type: String,
      default: '',
    },
  },
  { _id: true }
);

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
    },
    invoiceNumber: {
      type: String,
      trim: true,
      default: '',
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    items: [purchaseItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    totalTax: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Received', 'Cancelled'],
      default: 'Received',
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Paid'],
      default: 'Paid',
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

purchaseSchema.index({ purchaseNumber: 1, purchaseDate: -1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
