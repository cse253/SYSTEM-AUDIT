const RawMaterial = require('../models/RawMaterial');
const PackagingMaterial = require('../models/PackagingMaterial');
const AuditLog = require('../models/AuditLog');

// ==================== RAW MATERIALS ====================

// @desc    Get all raw materials
// @route   GET /api/materials/raw
// @access  Protected
const getRawMaterials = async (req, res, next) => {
  try {
    const { search, category, activeOnly = 'false' } = req.query;
    const query = {};

    if (activeOnly === 'true') {
      query.isActive = true;
    }
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const materials = await RawMaterial.find(query).sort({ name: 1 });
    res.json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create raw material
// @route   POST /api/materials/raw
// @access  Private (Admin, Owner, Production Supervisor)
const createRawMaterial = async (req, res, next) => {
  try {
    const { name, code, category, unit, currentStock, reorderLevel, valuationRate, hsnCode } = req.body;

    const existing = await RawMaterial.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Raw material code '${code}' already exists` });
    }

    const material = await RawMaterial.create({
      name,
      code: code.toUpperCase().trim(),
      category: category || 'General',
      unit: unit || 'kg',
      currentStock: Number(currentStock) || 0,
      reorderLevel: Number(reorderLevel) || 20,
      valuationRate: Number(valuationRate) || 0,
      hsnCode: hsnCode || '11010000',
    });

    await AuditLog.create({
      action: 'RAW_MATERIAL_CREATED',
      entity: 'RawMaterial',
      entityId: material._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: { code: material.code, name: material.name, currentStock: material.currentStock },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'Raw material created successfully', material });
  } catch (error) {
    next(error);
  }
};

// @desc    Update raw material
// @route   PUT /api/materials/raw/:id
// @access  Private (Admin, Owner, Production Supervisor)
const updateRawMaterial = async (req, res, next) => {
  try {
    let material = await RawMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Raw material not found' });
    }

    const updateData = { ...req.body };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase().trim();
    }
    // Prevent accidental manual overwrite of stock balance if not admin/supervisor
    if (updateData.currentStock !== undefined && !['admin', 'owner', 'production_supervisor'].includes(req.user.role)) {
      delete updateData.currentStock;
    }

    material = await RawMaterial.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Raw material updated successfully', material });
  } catch (error) {
    next(error);
  }
};

// ==================== PACKAGING MATERIALS ====================

// @desc    Get all packaging materials
// @route   GET /api/materials/packaging
// @access  Protected
const getPackagingMaterials = async (req, res, next) => {
  try {
    const { search, activeOnly = 'false' } = req.query;
    const query = {};

    if (activeOnly === 'true') {
      query.isActive = true;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const materials = await PackagingMaterial.find(query).sort({ name: 1 });
    res.json({
      success: true,
      count: materials.length,
      materials,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create packaging material
// @route   POST /api/materials/packaging
// @access  Private (Admin, Owner, Production Supervisor)
const createPackagingMaterial = async (req, res, next) => {
  try {
    const { name, code, unit, currentStock, reorderLevel, valuationRate, hsnCode } = req.body;

    const existing = await PackagingMaterial.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Packaging code '${code}' already exists` });
    }

    const material = await PackagingMaterial.create({
      name,
      code: code.toUpperCase().trim(),
      unit: unit || 'pieces',
      currentStock: Number(currentStock) || 0,
      reorderLevel: Number(reorderLevel) || 100,
      valuationRate: Number(valuationRate) || 0,
      hsnCode: hsnCode || '39232100',
    });

    await AuditLog.create({
      action: 'PACKAGING_MATERIAL_CREATED',
      entity: 'PackagingMaterial',
      entityId: material._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: { code: material.code, name: material.name, currentStock: material.currentStock },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'Packaging material created successfully', material });
  } catch (error) {
    next(error);
  }
};

// @desc    Update packaging material
// @route   PUT /api/materials/packaging/:id
// @access  Private (Admin, Owner, Production Supervisor)
const updatePackagingMaterial = async (req, res, next) => {
  try {
    let material = await PackagingMaterial.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Packaging material not found' });
    }

    const updateData = { ...req.body };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase().trim();
    }

    material = await PackagingMaterial.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Packaging material updated successfully', material });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRawMaterials,
  createRawMaterial,
  updateRawMaterial,
  getPackagingMaterials,
  createPackagingMaterial,
  updatePackagingMaterial,
};
