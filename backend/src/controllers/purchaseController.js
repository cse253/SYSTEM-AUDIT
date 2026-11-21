const Purchase = require('../models/Purchase');
const Supplier = require('../models/Supplier');
const RawMaterial = require('../models/RawMaterial');
const PackagingMaterial = require('../models/PackagingMaterial');
const { recordStockMovement, updateWeightedAverageCost } = require('../services/inventoryService');
const AuditLog = require('../models/AuditLog');

// Helper to generate sequential purchase number
const generatePurchaseNumber = async () => {
  const count = await Purchase.countDocuments();
  const year = new Date().getFullYear();
  return `PO-${year}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Record new purchase receipt
// @route   POST /api/purchases
// @access  Private (Admin, Owner, Production Supervisor)
const createPurchase = async (req, res, next) => {
  try {
    const { supplierId, invoiceNumber, items, purchaseDate, remarks } = req.body;

    if (!supplierId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Supplier and items are required' });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    const purchaseNumber = await generatePurchaseNumber();
    let subtotal = 0;
    let totalTax = 0;
    const processedItems = [];

    // Process each purchased item
    for (const line of items) {
      const isPackaging = line.itemType === 'PackagingMaterial';
      const model = isPackaging ? PackagingMaterial : RawMaterial;
      const material = await model.findById(line.item);
      if (!material) {
        return res.status(404).json({ success: false, message: `Material ${line.item} not found` });
      }

      const qty = Number(line.quantity);
      const rate = Number(line.unitRate);
      const gstRate = Number(line.gstPercentage || 5);
      const taxable = Math.round(qty * rate * 100) / 100;
      const gstAmount = Math.round(((taxable * gstRate) / 100) * 100) / 100;
      const totalAmount = Math.round((taxable + gstAmount) * 100) / 100;

      subtotal += taxable;
      totalTax += gstAmount;

      processedItems.push({
        itemType: line.itemType,
        item: material._id,
        itemName: material.name,
        quantity: qty,
        unit: material.unit,
        unitRate: rate,
        gstPercentage: gstRate,
        taxableAmount: taxable,
        gstAmount,
        totalAmount,
        batchNumber: line.batchNumber || '',
      });

      // Update Weighted Average Cost (WAC)
      await updateWeightedAverageCost(material._id, qty, rate, isPackaging);

      // Record stock ledger movement and increase stock (+1)
      await recordStockMovement({
        itemType: line.itemType,
        itemId: material._id,
        movementType: 'PURCHASE_RECEIPT',
        direction: 1,
        quantity: qty,
        unit: material.unit,
        unitRate: rate,
        sourceDocumentType: 'Purchase',
        sourceDocumentNumber: purchaseNumber,
        remarks: `Purchase from ${supplier.name} (Bill #${invoiceNumber || 'N/A'})`,
        userId: req.user._id,
      });
    }

    const grandTotal = Math.round((subtotal + totalTax) * 100) / 100;

    const purchase = await Purchase.create({
      purchaseNumber,
      supplier: supplier._id,
      invoiceNumber: invoiceNumber || '',
      purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
      items: processedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      grandTotal,
      status: 'Received',
      paymentStatus: 'Paid',
      receivedBy: req.user._id,
      remarks: remarks || '',
    });

    await AuditLog.create({
      action: 'PURCHASE_RECORDED',
      entity: 'Purchase',
      entityId: purchase._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: { purchaseNumber: purchase.purchaseNumber, supplier: supplier.name, grandTotal },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Purchase recorded and stock updated with Weighted Average Valuation',
      purchase,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Protected
const getPurchases = async (req, res, next) => {
  try {
    const { supplierId, startDate, endDate } = req.query;
    const query = {};

    if (supplierId) query.supplier = supplierId;
    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate);
      if (endDate) query.purchaseDate.$lte = new Date(endDate);
    }

    const purchases = await Purchase.find(query)
      .populate('supplier', 'name gstin phone state')
      .populate('receivedBy', 'name')
      .sort({ purchaseDate: -1 });

    res.json({
      success: true,
      count: purchases.length,
      purchases,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPurchase,
  getPurchases,
};
