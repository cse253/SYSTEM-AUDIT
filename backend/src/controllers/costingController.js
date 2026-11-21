const ProductionRun = require('../models/ProductionRun');
const Product = require('../models/Product');

// @desc    Get Costing & Profitability Analysis per packet
// @route   GET /api/costing/summary
// @access  Protected
const getCostingSummary = async (req, res, next) => {
  try {
    const runs = await ProductionRun.find({ status: 'Completed' })
      .populate('product', 'name sku sellingPrice')
      .sort({ productionDate: -1 });

    const totalOutput = runs.reduce((acc, r) => acc + (r.actualOutput || 0), 0);
    const totalCost = runs.reduce((acc, r) => acc + (r.totalProductionCost || 0), 0);
    const totalRawCost = runs.reduce((acc, r) => acc + (r.totalRawMaterialCost || 0), 0);
    const totalPkgCost = runs.reduce((acc, r) => acc + (r.totalPackagingCost || 0), 0);
    const totalLabour = runs.reduce((acc, r) => acc + (r.labourCost || 0), 0);
    const totalPower = runs.reduce((acc, r) => acc + (r.gasAndElectricityCost || 0), 0);

    const averageCostPerPacket =
      totalOutput > 0 ? Math.round((totalCost / totalOutput) * 100) / 100 : 0;

    res.json({
      success: true,
      summary: {
        totalBatches: runs.length,
        totalGoodPacketsProduced: totalOutput,
        totalProductionCost: Math.round(totalCost * 100) / 100,
        totalRawMaterialCost: Math.round(totalRawCost * 100) / 100,
        totalPackagingCost: Math.round(totalPkgCost * 100) / 100,
        totalLabourCost: Math.round(totalLabour * 100) / 100,
        totalPowerCost: Math.round(totalPower * 100) / 100,
        averageCostPerPacket,
      },
      batchCostings: runs.map((r) => ({
        runNumber: r.runNumber,
        productName: r.productName,
        actualOutput: r.actualOutput,
        totalCost: r.totalProductionCost,
        costPerPacket: r.costPerPacket,
        sellingPrice: r.sellingPricePerPacket,
        profitPerPacket: r.profitPerPacket,
        profitMarginPercentage: r.profitMarginPercentage,
        rawMaterialCost: r.totalRawMaterialCost,
        packagingCost: r.totalPackagingCost,
        labourCost: r.labourCost,
        powerCost: r.gasAndElectricityCost,
        date: r.productionDate,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCostingSummary,
};
