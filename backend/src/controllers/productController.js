const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

// @desc    Get all products
// @route   GET /api/products
// @access  Protected
const getProducts = async (req, res, next) => {
  try {
    const { category, search, activeOnly = 'false' } = req.query;
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
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ name: 1 });
    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Protected
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin / Owner)
const createProduct = async (req, res, next) => {
  try {
    const { name, sku, category, packSize, packUnit, sellingPrice, gstPercentage, hsnCode, unit, currentStock, minStockLevel, description } = req.body;

    const existing = await Product.findOne({ sku: sku.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Product with SKU '${sku}' already exists` });
    }

    const product = await Product.create({
      name,
      sku: sku.toUpperCase().trim(),
      category: category || 'Murukku',
      packSize: Number(packSize) || 200,
      packUnit: packUnit || 'g',
      sellingPrice: Number(sellingPrice),
      gstPercentage: Number(gstPercentage) || 5,
      hsnCode: hsnCode || '21069099',
      unit: unit || 'packets',
      currentStock: Number(currentStock) || 0,
      minStockLevel: Number(minStockLevel) || 100,
      description: description || '',
    });

    await AuditLog.create({
      action: 'PRODUCT_CREATED',
      entity: 'Product',
      entityId: product._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: { sku: product.sku, name: product.name, sellingPrice: product.sellingPrice },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin / Owner)
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const fieldsToUpdate = { ...req.body };
    if (fieldsToUpdate.sku) {
      fieldsToUpdate.sku = fieldsToUpdate.sku.toUpperCase().trim();
    }

    // Protect stock from direct overwrite by unauthorized actions
    // Stock must be updated via stock ledger or production/order workflows
    if (fieldsToUpdate.currentStock !== undefined && !['admin', 'owner'].includes(req.user.role)) {
      delete fieldsToUpdate.currentStock;
    }

    product = await Product.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    await AuditLog.create({
      action: 'PRODUCT_UPDATED',
      entity: 'Product',
      entityId: product._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: fieldsToUpdate,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate product
// @route   DELETE /api/products/:id
// @access  Private (Admin / Owner)
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Soft delete by deactivating
    product.isActive = false;
    await product.save();

    await AuditLog.create({
      action: 'PRODUCT_DEACTIVATED',
      entity: 'Product',
      entityId: product._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: { sku: product.sku },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Product deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
