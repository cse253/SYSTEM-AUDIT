const mongoose = require('mongoose');

const bomRawMaterialItemSchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawMaterial',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.0001, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      required: true,
    },
  },
  { _id: true }
);

const bomPackagingItemSchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PackagingMaterial',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.0001, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      required: true,
    },
  },
  { _id: true }
);

const bomSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    version: {
      type: String,
      default: 'v1.0',
      trim: true,
    },
    expectedOutput: {
      type: Number,
      required: [true, 'Expected batch output quantity is required'],
      min: [1, 'Expected output must be at least 1'],
    },
    outputUnit: {
      type: String,
      required: true,
      default: 'packets',
    },
    rawMaterials: [bomRawMaterialItemSchema],
    packagingMaterials: [bomPackagingItemSchema],
    notes: {
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

bomSchema.index({ product: 1, isActive: 1 });

module.exports = mongoose.model('BOM', bomSchema);
