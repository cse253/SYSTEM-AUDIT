const mongoose = require('mongoose');

const packagingMaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Packaging material name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Packaging code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      default: 'pieces',
      trim: true,
    },
    currentStock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    reorderLevel: {
      type: Number,
      default: 100,
    },
    valuationRate: {
      type: Number,
      required: [true, 'Valuation rate is required'],
      default: 0,
      min: 0,
    },
    totalValue: {
      type: Number,
      default: 0,
    },
    hsnCode: {
      type: String,
      default: '39232100',
      trim: true,
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

packagingMaterialSchema.pre('save', function () {
  this.totalValue = Math.round(this.currentStock * this.valuationRate * 100) / 100;
});

packagingMaterialSchema.index({ code: 1, name: 1 });

module.exports = mongoose.model('PackagingMaterial', packagingMaterialSchema);
