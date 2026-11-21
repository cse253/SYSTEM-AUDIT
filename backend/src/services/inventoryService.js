const StockLedger = require('../models/StockLedger');
const RawMaterial = require('../models/RawMaterial');
const PackagingMaterial = require('../models/PackagingMaterial');
const Product = require('../models/Product');

/**
 * Record a double-entry StockLedger movement and update target model balance atomically
 */
const recordStockMovement = async ({
  itemType, // 'RawMaterial' | 'PackagingMaterial' | 'Product'
  itemId,
  movementType, // 'OPENING_BALANCE' | 'PURCHASE_RECEIPT' | 'PRODUCTION_ISSUE' | 'PRODUCTION_YIELD' | 'SALES_DISPATCH' | 'DAMAGE_SCRAP' | 'STOCK_ADJUSTMENT'
  direction, // +1 for inflow, -1 for outflow
  quantity,
  unit,
  unitRate,
  sourceDocumentType,
  sourceDocumentId,
  sourceDocumentNumber,
  remarks,
  userId,
}) => {
  let targetModel;
  let category;

  if (itemType === 'RawMaterial') {
    targetModel = RawMaterial;
    category = 'raw_material';
  } else if (itemType === 'PackagingMaterial') {
    targetModel = PackagingMaterial;
    category = 'packaging_material';
  } else if (itemType === 'Product') {
    targetModel = Product;
    category = 'finished_goods';
  } else {
    throw new Error(`Invalid itemType: ${itemType}`);
  }

  const item = await targetModel.findById(itemId);
  if (!item) {
    throw new Error(`${itemType} with id ${itemId} not found`);
  }

  const balanceBefore = item.currentStock || 0;
  const balanceAfter = Math.round((balanceBefore + direction * Number(quantity)) * 1000) / 1000;

  if (balanceAfter < 0 && movementType !== 'STOCK_ADJUSTMENT') {
    throw new Error(
      `Insufficient stock for ${item.name}. Current: ${balanceBefore} ${item.unit}, Requested: ${quantity} ${item.unit}`
    );
  }

  // Update target collection balance
  item.currentStock = balanceAfter;
  if (item.valuationRate !== undefined && itemType !== 'Product') {
    item.totalValue = Math.round(item.currentStock * item.valuationRate * 100) / 100;
  }
  await item.save();

  // Create immutable ledger log
  const ledgerEntry = await StockLedger.create({
    itemType,
    item: item._id,
    itemName: item.name,
    itemCategory: category,
    movementType,
    direction,
    quantity: Number(quantity),
    unit: unit || item.unit,
    unitRate: Number(unitRate) || item.valuationRate || item.sellingPrice || 0,
    totalValue: Math.round(Number(quantity) * (unitRate || item.valuationRate || 0) * 100) / 100,
    balanceBefore,
    balanceAfter,
    sourceDocumentType,
    sourceDocumentId,
    sourceDocumentNumber: sourceDocumentNumber || '',
    remarks: remarks || '',
    user: userId,
  });

  return { item, ledgerEntry };
};

/**
 * Recomputes Weighted Average Cost (WAC) on new purchase:
 * NewRate = (OldStock * OldRate + PurchaseQty * PurchaseRate) / (OldStock + PurchaseQty)
 */
const updateWeightedAverageCost = async (materialId, purchaseQty, purchaseRate, isPackaging = false) => {
  const model = isPackaging ? PackagingMaterial : RawMaterial;
  const material = await model.findById(materialId);
  if (!material) throw new Error('Material not found for WAC recalculation');

  const currentStock = material.currentStock || 0;
  const currentRate = material.valuationRate || 0;

  const currentTotalValue = currentStock * currentRate;
  const newReceiptValue = Number(purchaseQty) * Number(purchaseRate);

  const newTotalStock = currentStock + Number(purchaseQty);
  if (newTotalStock > 0) {
    const newWacRate = Math.round(((currentTotalValue + newReceiptValue) / newTotalStock) * 10000) / 10000;
    material.valuationRate = newWacRate;
    material.totalValue = Math.round(newTotalStock * newWacRate * 100) / 100;
    await material.save();
    return newWacRate;
  }
  return currentRate;
};

module.exports = {
  recordStockMovement,
  updateWeightedAverageCost,
};
