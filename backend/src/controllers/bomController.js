const BOM = require('../models/BOM');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

// @desc    Get all BOMs
// @route   GET /api/bom
// @access  Protected
const getBOMs = async (req, res, next) => {
  try {
    const boms = await BOM.find({ isActive: true })
      .populate('product', 'name sku packSize sellingPrice currentStock')
      .populate('rawMaterials.material', 'name code unit valuationRate')
      .populate('packagingMaterials.material', 'name code unit valuationRate')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: boms.length,
      boms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get BOM by product ID
// @route   GET /api/bom/product/:productId
// @access  Protected
const getBOMByProductId = async (req, res, next) => {
  try {
    const bom = await BOM.findOne({ product: req.params.productId, isActive: true })
      .populate('product')
      .populate('rawMaterials.material')
      .populate('packagingMaterials.material');

    if (!bom) {
      return res.status(404).json({ success: false, message: 'BOM not found for this product' });
    }

    res.json({ success: true, bom });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or version BOM
// @route   POST /api/bom
// @access  Private (Admin, Owner, Production Supervisor)
const createBOM = async (req, res, next) => {
  try {
    const { product, version, expectedOutput, outputUnit, rawMaterials, packagingMaterials, notes } = req.body;

    const prod = await Product.findById(product);
    if (!prod) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Deactivate previous active BOM for this product if creating new version
    await BOM.updateMany({ product }, { isActive: false });

    const bom = await BOM.create({
      product,
      version: version || 'v1.0',
      expectedOutput: Number(expectedOutput) || 200,
      outputUnit: outputUnit || 'packets',
      rawMaterials,
      packagingMaterials,
      notes: notes || '',
      isActive: true,
    });

    await AuditLog.create({
      action: 'BOM_CREATED',
      entity: 'BOM',
      entityId: bom._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: { product: prod.name, version: bom.version, expectedOutput: bom.expectedOutput },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'BOM created successfully', bom });
  } catch (error) {
    next(error);
  }
};

// @desc    Update BOM
// @route   PUT /api/bom/:id
// @access  Private (Admin, Owner, Production Supervisor)
const updateBOM = async (req, res, next) => {
  try {
    const bom = await BOM.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!bom) {
      return res.status(404).json({ success: false, message: 'BOM not found' });
    }

    res.json({ success: true, message: 'BOM updated successfully', bom });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBOMs,
  getBOMByProductId,
  createBOM,
  updateBOM,
};
