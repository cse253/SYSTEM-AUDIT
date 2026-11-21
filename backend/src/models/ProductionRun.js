const mongoose = require('mongoose');

const rawMaterialConsumptionSchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RawMaterial',
      required: true,
    },
    materialName: {
      type: String,
      required: true,
    },
    plannedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    actualQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    varianceQuantity: {
      type: Number,
      default: 0,
    },
    variancePercentage: {
      type: Number,
      default: 0,
    },
    isVarianceFlagged: {
      type: Boolean,
      default: false, // Flagged if abs(variancePercentage) > 3%
    },
    unitCost: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const packagingConsumptionSchema = new mongoose.Schema(
  {
    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PackagingMaterial',
      required: true,
    },
    materialName: {
      type: String,
      required: true,
    },
    plannedQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    actualQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    damagedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalQuantityUsed: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    unitCost: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const productionRunSchema = new mongoose.Schema(
  {
    runNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    bom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BOM',
      required: true,
    },
    batchMultiplier: {
      type: Number,
      default: 1, // 1 batch, 2 batches, etc.
    },
    expectedOutput: {
      type: Number,
      required: true,
      min: 1,
    },
    actualOutput: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      default: 'packets',
    },
    yieldVarianceQuantity: {
      type: Number,
      default: 0,
    },
    yieldVariancePercentage: {
      type: Number,
      default: 0,
    },
    isYieldFlagged: {
      type: Boolean,
      default: false, // Flagged if abs(yieldVariancePercentage) > 3%
    },
    rawMaterials: [rawMaterialConsumptionSchema],
    packagingMaterials: [packagingConsumptionSchema],
    wastageRemarks: {
      type: String,
      default: '',
    },
    labourCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    gasAndElectricityCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRawMaterialCost: {
      type: Number,
      default: 0,
    },
    totalPackagingCost: {
      type: Number,
      default: 0,
    },
    totalProductionCost: {
      type: Number,
      default: 0,
    },
    costPerPacket: {
      type: Number,
      default: 0,
    },
    sellingPricePerPacket: {
      type: Number,
      default: 0,
    },
    profitPerPacket: {
      type: Number,
      default: 0,
    },
    profitMarginPercentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Completed', 'Draft', 'Cancelled'],
      default: 'Completed',
    },
    productionDate: {
      type: Date,
      default: Date.now,
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

productionRunSchema.index({ runNumber: 1, product: 1, productionDate: -1 });

module.exports = mongoose.model('ProductionRun', productionRunSchema);
