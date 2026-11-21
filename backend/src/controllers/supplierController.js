const Supplier = require('../models/Supplier');
const AuditLog = require('../models/AuditLog');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Protected
const getSuppliers = async (req, res, next) => {
  try {
    const { search, materialType, activeOnly = 'false' } = req.query;
    const query = {};

    if (activeOnly === 'true') {
      query.isActive = true;
    }
    if (materialType) {
      query.suppliedMaterialTypes = materialType;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const suppliers = await Supplier.find(query).sort({ name: 1 });
    res.json({
      success: true,
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Protected
const getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.json({ success: true, supplier });
  } catch (error) {
    next(error);
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private (Admin, Owner, Production Supervisor)
const createSupplier = async (req, res, next) => {
  try {
    const { name, contactPerson, gstin, phone, email, address, state, stateCode, suppliedMaterialTypes } = req.body;

    const supplier = await Supplier.create({
      name,
      contactPerson: contactPerson || '',
      gstin: gstin ? gstin.toUpperCase().trim() : '',
      phone,
      email: email ? email.toLowerCase().trim() : '',
      address,
      state: state || 'Tamil Nadu',
      stateCode: stateCode || '33',
      suppliedMaterialTypes: suppliedMaterialTypes || ['RawMaterial'],
    });

    await AuditLog.create({
      action: 'SUPPLIER_CREATED',
      entity: 'Supplier',
      entityId: supplier._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: { name: supplier.name },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'Supplier created successfully', supplier });
  } catch (error) {
    next(error);
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin, Owner)
const updateSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.json({ success: true, message: 'Supplier updated successfully', supplier });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin, Owner)
const deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    supplier.isActive = false;
    await supplier.save();

    res.json({ success: true, message: 'Supplier deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
