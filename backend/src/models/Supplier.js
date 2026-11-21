const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      trim: true,
    },
    contactPerson: {
      type: String,
      trim: true,
      default: '',
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    state: {
      type: String,
      default: 'Tamil Nadu',
      trim: true,
    },
    stateCode: {
      type: String,
      default: '33',
      trim: true,
    },
    suppliedMaterialTypes: [
      {
        type: String,
        enum: ['RawMaterial', 'PackagingMaterial'],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

supplierSchema.index({ name: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);
