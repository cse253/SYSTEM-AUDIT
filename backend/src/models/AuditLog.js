const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    entity: {
      type: String,
      required: true,
      enum: [
        'User',
        'Product',
        'Customer',
        'Supplier',
        'RawMaterial',
        'PackagingMaterial',
        'BOM',
        'Purchase',
        'SalesOrder',
        'Invoice',
        'ProductionRun',
        'StockLedger',
        'Payment',
        'Expense',
        'System',
      ],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
      default: 'System',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ entity: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
