const StockLedger = require('../models/StockLedger');
const RawMaterial = require('../models/RawMaterial');
const PackagingMaterial = require('../models/PackagingMaterial');
const Product = require('../models/Product');
const { recordStockMovement } = require('../services/inventoryService');
const AuditLog = require('../models/AuditLog');

// @desc    Get Stock Ledger double-entry movements
// @route   GET /api/inventory/ledger
// @access  Protected
const getStockLedger = async (req, res, next) => {
  try {
    const { itemCategory, movementType, startDate, endDate, itemId } = req.query;
    const query = {};

    if (itemCategory) query.itemCategory = itemCategory;
    if (movementType) query.movementType = movementType;
    if (itemId) query.item = itemId;
    if (startDate || endDate) {
      query.movementDate = {};
      if (startDate) query.movementDate.$gte = new Date(startDate);
      if (endDate) query.movementDate.$lte = new Date(endDate);
    }

    const ledger = await StockLedger.find(query)
      .populate('user', 'name role')
      .sort({ movementDate: -1, createdAt: -1 });

    res.json({
      success: true,
      count: ledger.length,
      ledger,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Stock Summary across all three categories (Raw, Packaging, Finished)
// @route   GET /api/inventory/summary
// @access  Protected
const getStockSummary = async (req, res, next) => {
  try {
    const [rawMaterials, packagingMaterials, products] = await Promise.all([
      RawMaterial.find({ isActive: true }).sort({ name: 1 }),
      PackagingMaterial.find({ isActive: true }).sort({ name: 1 }),
      Product.find({ isActive: true }).sort({ name: 1 }),
    ]);

    const rawTotalValue = rawMaterials.reduce((acc, rm) => acc + (rm.totalValue || rm.currentStock * rm.valuationRate), 0);
    const pkgTotalValue = packagingMaterials.reduce((acc, pm) => acc + (pm.totalValue || pm.currentStock * pm.valuationRate), 0);
    const fgTotalValue = products.reduce((acc, p) => acc + (p.currentStock * p.sellingPrice), 0);

    res.json({
      success: true,
      rawMaterials: {
        items: rawMaterials,
        totalValuation: Math.round(rawTotalValue * 100) / 100,
      },
      packagingMaterials: {
        items: packagingMaterials,
        totalValuation: Math.round(pkgTotalValue * 100) / 100,
      },
      finishedGoods: {
        items: products,
        totalValuation: Math.round(fgTotalValue * 100) / 100,
      },
      grandTotalInventoryValuation: Math.round((rawTotalValue + pkgTotalValue + fgTotalValue) * 100) / 100,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record authorized stock adjustment
// @route   POST /api/inventory/adjustment
// @access  Private (Admin, Owner)
const adjustStock = async (req, res, next) => {
  try {
    const { itemType, itemId, adjustmentQuantity, reason } = req.body;

    if (!itemType || !itemId || adjustmentQuantity === undefined) {
      return res.status(400).json({ success: false, message: 'Missing adjustment parameters' });
    }

    const direction = Number(adjustmentQuantity) >= 0 ? 1 : -1;
    const absQty = Math.abs(Number(adjustmentQuantity));

    const { item, ledgerEntry } = await recordStockMovement({
      itemType,
      itemId,
      movementType: 'STOCK_ADJUSTMENT',
      direction,
      quantity: absQty,
      sourceDocumentType: 'ManualAdjustment',
      remarks: reason || 'Authorized physical audit stock adjustment',
      userId: req.user._id,
    });

    await AuditLog.create({
      action: 'STOCK_ADJUSTED',
      entity: itemType,
      entityId: item._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: { item: item.name, adjustmentQuantity, reason },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Stock adjustment recorded in ledger successfully',
      item,
      ledgerEntry,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStockLedger,
  getStockSummary,
  adjustStock,
};
