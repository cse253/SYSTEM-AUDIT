const Customer = require('../models/Customer');
const AuditLog = require('../models/AuditLog');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Protected
const getCustomers = async (req, res, next) => {
  try {
    const { customerType, state, search, activeOnly = 'false' } = req.query;
    const query = {};

    if (activeOnly === 'true') {
      query.isActive = true;
    }
    if (customerType) {
      query.customerType = customerType;
    }
    if (state) {
      query.state = state;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { gstin: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query)
      .populate('customerPricing.product', 'name sku sellingPrice')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Protected
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('customerPricing.product', 'name sku sellingPrice');

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Create customer
// @route   POST /api/customers
// @access  Private (Salesman, Admin, Owner)
const createCustomer = async (req, res, next) => {
  try {
    const { name, customerType, gstin, phone, email, address, city, state, stateCode, creditLimit, customerPricing } = req.body;

    const customer = await Customer.create({
      name,
      customerType: customerType || 'Retailer',
      gstin: gstin ? gstin.toUpperCase().trim() : '',
      phone,
      email: email ? email.toLowerCase().trim() : '',
      address,
      city: city || 'Tiruchirappalli',
      state: state || 'Tamil Nadu',
      stateCode: stateCode || (state === 'Karnataka' ? '29' : '33'),
      creditLimit: Number(creditLimit) || 50000,
      customerPricing: customerPricing || [],
    });

    await AuditLog.create({
      action: 'CUSTOMER_CREATED',
      entity: 'Customer',
      entityId: customer._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: { name: customer.name, customerType: customer.customerType, state: customer.state },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'Customer created successfully', customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (Salesman, Admin, Owner)
const updateCustomer = async (req, res, next) => {
  try {
    let customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const fieldsToUpdate = { ...req.body };
    if (fieldsToUpdate.gstin) {
      fieldsToUpdate.gstin = fieldsToUpdate.gstin.toUpperCase().trim();
    }
    if (fieldsToUpdate.state === 'Karnataka' && !fieldsToUpdate.stateCode) {
      fieldsToUpdate.stateCode = '29';
    } else if (fieldsToUpdate.state === 'Tamil Nadu' && !fieldsToUpdate.stateCode) {
      fieldsToUpdate.stateCode = '33';
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    await AuditLog.create({
      action: 'CUSTOMER_UPDATED',
      entity: 'Customer',
      entityId: customer._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: fieldsToUpdate,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Customer updated successfully', customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin, Owner)
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    customer.isActive = false;
    await customer.save();

    await AuditLog.create({
      action: 'CUSTOMER_DEACTIVATED',
      entity: 'Customer',
      entityId: customer._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: { name: customer.name },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Customer deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
