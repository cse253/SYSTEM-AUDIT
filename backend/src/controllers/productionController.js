const ProductionRun = require('../models/ProductionRun');
const Product = require('../models/Product');
const BOM = require('../models/BOM');
const RawMaterial = require('../models/RawMaterial');
const PackagingMaterial = require('../models/PackagingMaterial');
const Expense = require('../models/Expense');
const AuditLog = require('../models/AuditLog');
const { recordStockMovement } = require('../services/inventoryService');
const { calculateProductionVariances } = require('../services/bomService');

// Helper to generate sequential production run number
const generateRunNumber = async () => {
  const year = new Date().getFullYear();
  let nextSeq = (await ProductionRun.countDocuments()) + 1;
  while (await ProductionRun.exists({ runNumber: `PR-${year}-${String(nextSeq).padStart(4, '0')}` })) {
    nextSeq++;
  }
  return `PR-${year}-${String(nextSeq).padStart(4, '0')}`;
};

// @desc    Create and execute production run batch
// @route   POST /api/production
// @access  Private (Admin, Owner, Production Supervisor)
const createProductionRun = async (req, res, next) => {
  try {
    const {
      productId,
      bomId,
      batchMultiplier = 1,
      expectedOutput,
      actualOutput,
      rawMaterials, // array of { materialId, actualQuantity }
      packagingMaterials, // array of { materialId, actualQuantity, damagedQuantity }
      labourCost = 0,
      gasAndElectricityCost = 0,
      notes,
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const bom = await BOM.findById(bomId)
      .populate('rawMaterials.material')
      .populate('packagingMaterials.material');
    if (!bom) {
      return res.status(404).json({ success: false, message: 'BOM not found' });
    }

    const expectedQty = Number(expectedOutput) || bom.expectedOutput * Number(batchMultiplier);
    const actualQty = Number(actualOutput);

    // 1. Prepare Raw Materials with planned and actual consumption
    const enrichedRawMaterials = [];
    for (const bLine of bom.rawMaterials) {
      const enteredActual = rawMaterials?.find(
        (rm) => rm.materialId.toString() === bLine.material._id.toString()
      );
      const plannedQty = Number(bLine.quantity) * Number(batchMultiplier);
      const actualConsumed = enteredActual ? Number(enteredActual.actualQuantity) : plannedQty;

      enrichedRawMaterials.push({
        material: bLine.material._id,
        materialName: bLine.material.name,
        plannedQuantity: plannedQty,
        actualQuantity: actualConsumed,
        unit: bLine.unit,
        unitCost: bLine.material.valuationRate || 0,
      });
    }

    // 2. Prepare Packaging Materials with planned, actual, and damaged counts
    const enrichedPackaging = [];
    for (const pLine of bom.packagingMaterials) {
      const enteredPkg = packagingMaterials?.find(
        (pm) => pm.materialId.toString() === pLine.material._id.toString()
      );
      const plannedQty = Number(pLine.quantity) * Number(batchMultiplier);
      const actualUsed = enteredPkg ? Number(enteredPkg.actualQuantity) : actualQty;
      const damagedQty = enteredPkg ? Number(enteredPkg.damagedQuantity || 0) : 0;

      enrichedPackaging.push({
        material: pLine.material._id,
        materialName: pLine.material.name,
        plannedQuantity: plannedQty,
        actualQuantity: actualUsed,
        damagedQuantity: damagedQty,
        unit: pLine.unit,
        unitCost: pLine.material.valuationRate || 0,
      });
    }

    // 3. Compute Variances and Costs
    const varianceResult = calculateProductionVariances({
      expectedOutput: expectedQty,
      actualOutput: actualQty,
      rawMaterials: enrichedRawMaterials,
      packagingMaterials: enrichedPackaging,
    });

    const totalLabour = Number(labourCost) || 0;
    const totalPower = Number(gasAndElectricityCost) || 0;
    const totalDirectExpenses = totalLabour + totalPower;

    const totalProductionCost =
      Math.round(
        (varianceResult.totalRawMaterialCost +
          varianceResult.totalPackagingCost +
          totalDirectExpenses) *
          100
      ) / 100;

    const costPerPacket =
      actualQty > 0 ? Math.round((totalProductionCost / actualQty) * 100) / 100 : 0;
    const sellingPrice = product.sellingPrice || 0;
    const profitPerPacket = Math.round((sellingPrice - costPerPacket) * 100) / 100;
    const profitMarginPercentage =
      sellingPrice > 0 ? Math.round((profitPerPacket / sellingPrice) * 10000) / 100 : 0;

    // PRE-VALIDATE STOCK AVAILABILITY TO ENSURE COMPLETE ATOMICITY
    const shortages = [];
    for (const rm of varianceResult.rawMaterials) {
      const rmDoc = await RawMaterial.findById(rm.material);
      if (!rmDoc || rmDoc.currentStock < rm.actualQuantity) {
        shortages.push({
          type: 'RawMaterial',
          materialName: rm.materialName,
          available: rmDoc ? rmDoc.currentStock : 0,
          requested: rm.actualQuantity,
          unit: rm.unit,
        });
      }
    }

    for (const pm of varianceResult.packagingMaterials) {
      const pmDoc = await PackagingMaterial.findById(pm.material);
      if (!pmDoc || pmDoc.currentStock < pm.totalQuantityUsed) {
        shortages.push({
          type: 'PackagingMaterial',
          materialName: pm.materialName,
          available: pmDoc ? pmDoc.currentStock : 0,
          requested: pm.totalQuantityUsed,
          unit: pm.unit,
        });
      }
    }

    if (shortages.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot execute production run: Insufficient stock for one or more materials.',
        shortages,
      });
    }

    const runNumber = await generateRunNumber();

    // 4. ATOMIC STOCK MOVEMENTS
    // A. Deduct Raw Materials issued/consumed
    for (const rm of varianceResult.rawMaterials) {
      await recordStockMovement({
        itemType: 'RawMaterial',
        itemId: rm.material,
        movementType: 'PRODUCTION_ISSUE',
        direction: -1,
        quantity: rm.actualQuantity,
        unit: rm.unit,
        unitRate: rm.unitCost,
        sourceDocumentType: 'ProductionRun',
        sourceDocumentNumber: runNumber,
        remarks: `Production issue for ${product.name} (Batch #${runNumber})`,
        userId: req.user._id,
      });
    }

    // B. Deduct Packaging Materials consumed + damaged
    for (const pm of varianceResult.packagingMaterials) {
      await recordStockMovement({
        itemType: 'PackagingMaterial',
        itemId: pm.material,
        movementType: 'PRODUCTION_ISSUE',
        direction: -1,
        quantity: pm.totalQuantityUsed,
        unit: pm.unit,
        unitRate: pm.unitCost,
        sourceDocumentType: 'ProductionRun',
        sourceDocumentNumber: runNumber,
        remarks: `Packaging used (${pm.actualQuantity} good + ${pm.damagedQuantity} damaged) for ${product.name}`,
        userId: req.user._id,
      });
    }

    // C. Increase Finished Goods Stock (+actualOutput)
    await recordStockMovement({
      itemType: 'Product',
      itemId: product._id,
      movementType: 'PRODUCTION_YIELD',
      direction: 1,
      quantity: actualQty,
      unit: product.unit || 'packets',
      unitRate: costPerPacket,
      sourceDocumentType: 'ProductionRun',
      sourceDocumentNumber: runNumber,
      remarks: `Finished goods production yield for ${product.name} (Batch #${runNumber})`,
      userId: req.user._id,
    });

    // 5. Create Production Run Record
    const productionRun = await ProductionRun.create({
      runNumber,
      product: product._id,
      productName: product.name,
      bom: bom._id,
      batchMultiplier: Number(batchMultiplier),
      expectedOutput: expectedQty,
      actualOutput: actualQty,
      unit: product.unit || 'packets',
      yieldVarianceQuantity: varianceResult.yieldVarianceQuantity,
      yieldVariancePercentage: varianceResult.yieldVariancePercentage,
      isYieldFlagged: varianceResult.isYieldFlagged,
      rawMaterials: varianceResult.rawMaterials,
      packagingMaterials: varianceResult.packagingMaterials,
      labourCost: totalLabour,
      gasAndElectricityCost: totalPower,
      totalRawMaterialCost: varianceResult.totalRawMaterialCost,
      totalPackagingCost: varianceResult.totalPackagingCost,
      totalProductionCost,
      costPerPacket,
      sellingPricePerPacket: sellingPrice,
      profitPerPacket,
      profitMarginPercentage,
      status: 'Completed',
      productionDate: new Date(),
      supervisor: req.user._id,
      notes: notes || '',
    });

    // 6. Record Direct Production Expenses if present
    if (totalLabour > 0) {
      await Expense.create({
        expenseNumber: `EXP-${runNumber}-LABOUR`,
        category: 'LABOUR',
        amount: totalLabour,
        description: `Direct production labour cost for batch ${runNumber}`,
        productionRun: productionRun._id,
        recordedBy: req.user._id,
      });
    }

    if (totalPower > 0) {
      await Expense.create({
        expenseNumber: `EXP-${runNumber}-POWER`,
        category: 'GAS_POWER',
        amount: totalPower,
        description: `Gas and electricity cost for batch ${runNumber}`,
        productionRun: productionRun._id,
        recordedBy: req.user._id,
      });
    }

    await AuditLog.create({
      action: 'PRODUCTION_RUN_COMPLETED',
      entity: 'ProductionRun',
      entityId: productionRun._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: {
        runNumber: productionRun.runNumber,
        product: product.name,
        actualOutput: productionRun.actualOutput,
        yieldVariance: productionRun.yieldVariancePercentage,
        costPerPacket: productionRun.costPerPacket,
      },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Production run recorded successfully with inventory updates & variance calculations',
      productionRun,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all production runs
// @route   GET /api/production
// @access  Protected
const getProductionRuns = async (req, res, next) => {
  try {
    const { productId, status } = req.query;
    const query = {};

    if (productId) query.product = productId;
    if (status) query.status = status;

    const runs = await ProductionRun.find(query)
      .populate('product', 'name sku packSize sellingPrice')
      .populate('bom', 'version expectedOutput')
      .populate('supervisor', 'name email')
      .sort({ productionDate: -1 });

    res.json({
      success: true,
      count: runs.length,
      productionRuns: runs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get production run by ID
// @route   GET /api/production/:id
// @access  Protected
const getProductionRunById = async (req, res, next) => {
  try {
    const run = await ProductionRun.findById(req.params.id)
      .populate('product')
      .populate('bom')
      .populate('supervisor', 'name email');

    if (!run) {
      return res.status(404).json({ success: false, message: 'Production run not found' });
    }

    res.json({ success: true, productionRun: run });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProductionRun,
  getProductionRuns,
  getProductionRunById,
};
