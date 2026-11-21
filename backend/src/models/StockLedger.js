const mongoose = require('mongoose');

const stockLedgerSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      required: true,
      enum: ['RawMaterial', 'PackagingMaterial', 'Product'],
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'itemType',
    },
    itemName: {
      type: String,
      required: true,
    },
    itemCategory: {
      type: String,
      required: true,
      enum: ['raw_material', 'packaging_material', 'finished_goods'],
    },
    movementType: {
      type: String,
      required: true,
      enum: [
        'OPENING_BALANCE',
        'PURCHASE_RECEIPT',
        'PRODUCTION_ISSUE',
        'PRODUCTION_YIELD',
        'SALES_DISPATCH',
        'DAMAGE_SCRAP',
        'STOCK_ADJUSTMENT',
      ],
    },
    // Direction: +1 for inflow, -1 for outflow
    direction: {
      type: Number,
      required: true,
      enum: [1, -1],
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.0001, 'Quantity must be positive'],
    },
    unit: {
      type: String,
      required: true,
    },
    unitRate: {
      type: Number,
      default: 0,
    },
    totalValue: {
      type: Number,
      default: 0,
    },
    balanceBefore: {
      type: Number,
      required: true,
      default: 0,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    sourceDocumentType: {
      type: String,
      required: true,
      enum: [
        'InitialSetup',
        'Purchase',
        'ProductionRun',
        'SalesOrder',
        'Invoice',
        'ManualAdjustment',
      ],
    },
    sourceDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    sourceDocumentNumber: {
      type: String,
      default: '',
    },
    movementDate: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

stockLedgerSchema.index({ item: 1, itemType: 1, movementDate: -1 });
stockLedgerSchema.index({ movementType: 1, movementDate: -1 });

module.exports = mongoose.model('StockLedger', stockLedgerSchema);
