const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Murukku', 'Mixture', 'Chips', 'Sweets', 'Namkeen', 'Other'],
      default: 'Murukku',
    },
    packSize: {
      type: Number,
      required: [true, 'Pack size is required'],
      default: 200,
    },
    packUnit: {
      type: String,
      default: 'g',
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price before tax is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    gstPercentage: {
      type: Number,
      required: [true, 'GST percentage is required'],
      default: 5,
    },
    hsnCode: {
      type: String,
      required: [true, 'HSN code is required'],
      default: '21069099',
      trim: true,
    },
    unit: {
      type: String,
      default: 'packets',
      trim: true,
    },
    currentStock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    minStockLevel: {
      type: Number,
      default: 100,
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ sku: 1, name: 1 });

module.exports = mongoose.model('Product', productSchema);
