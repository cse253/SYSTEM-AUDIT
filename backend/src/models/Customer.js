const mongoose = require('mongoose');

const customerPricingSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    customPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerType: {
      type: String,
      required: [true, 'Customer type is required'],
      enum: ['Retailer', 'Distributor'],
      default: 'Retailer',
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
    city: {
      type: String,
      trim: true,
      default: 'Tiruchirappalli',
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      default: 'Tamil Nadu',
    },
    stateCode: {
      type: String,
      required: [true, 'State code is required'],
      trim: true,
      default: '33', // 33 for Tamil Nadu, 29 for Karnataka
    },
    creditLimit: {
      type: Number,
      default: 50000,
    },
    outstandingBalance: {
      type: Number,
      default: 0,
    },
    customerPricing: [customerPricingSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.index({ name: 1, phone: 1, state: 1 });

module.exports = mongoose.model('Customer', customerSchema);
