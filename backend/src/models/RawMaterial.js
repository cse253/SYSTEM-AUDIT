const mongoose = require('mongoose');

const rawMaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Raw material name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Item code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    unit: {
      type: String,
      required: [true, 'Measurement unit is required'],
      enum: ['kg', 'litres', 'grams', 'pieces', 'bags'],
      default: 'kg',
    },
    currentStock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    reorderLevel: {
      type: Number,
      default: 20,
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
      default: '11010000',
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

// Virtual for auto calculated total value
rawMaterialSchema.pre('save', function () {
  this.totalValue = Math.round(this.currentStock * this.valuationRate * 100) / 100;
});

rawMaterialSchema.index({ code: 1, name: 1 });

module.exports = mongoose.model('RawMaterial', rawMaterialSchema);
