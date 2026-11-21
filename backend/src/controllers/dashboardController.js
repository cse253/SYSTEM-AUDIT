const Product = require('../models/Product');
const RawMaterial = require('../models/RawMaterial');
const PackagingMaterial = require('../models/PackagingMaterial');
const SalesOrder = require('../models/SalesOrder');
const Invoice = require('../models/Invoice');
const ProductionRun = require('../models/ProductionRun');
const Customer = require('../models/Customer');
const StockLedger = require('../models/StockLedger');

// @desc    Get comprehensive dashboard summary metrics
// @route   GET /api/dashboard/summary
// @access  Protected
const getDashboardSummary = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Today's Orders
    const todaysOrders = await SalesOrder.find({
      createdAt: { $gte: today },
    }).populate('customer', 'name');

    // 2. Monthly Sales (Invoiced)
    const monthlyInvoices = await Invoice.find({
      invoiceDate: { $gte: firstDayOfMonth },
      status: 'Active',
    });
    const monthlySalesTotal = monthlyInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);

    // 3. Total Production (Finished Goods produced this month)
    const monthlyProductionRuns = await ProductionRun.find({
      productionDate: { $gte: firstDayOfMonth },
      status: 'Completed',
    });
    const monthlyProductionUnits = monthlyProductionRuns.reduce((acc, run) => acc + (run.actualOutput || 0), 0);

    // 4. Finished Goods Stock Status & Low Stock Alerts
    const products = await Product.find({ isActive: true });
    const lowStockProducts = products.filter((p) => p.currentStock <= p.minStockLevel);

    // 5. Raw Materials & Low Stock Alerts
    const rawMaterials = await RawMaterial.find({ isActive: true });
    const lowStockRawMaterials = rawMaterials.filter((rm) => rm.currentStock <= rm.reorderLevel);
    const rawMaterialValuation = rawMaterials.reduce((acc, rm) => acc + (rm.currentStock * rm.valuationRate), 0);

    // 6. Packaging Materials & Alerts
    const packagingMaterials = await PackagingMaterial.find({ isActive: true });
    const lowStockPackaging = packagingMaterials.filter((pm) => pm.currentStock <= pm.reorderLevel);

    // 7. Total Outstanding Receivables (from customers)
    const customers = await Customer.find({ isActive: true });
    const totalOutstandingReceivables = customers.reduce((acc, c) => acc + (c.outstandingBalance || 0), 0);

    // 8. Production Variance Alerts (Runs where variance exceeded 3%)
    const varianceAlertRuns = await ProductionRun.find({
      $or: [
        { isYieldFlagged: true },
        { 'rawMaterials.isVarianceFlagged': true },
      ],
    })
      .sort({ productionDate: -1 })
      .limit(5);

    // 9. Recent Sales Orders
    const recentOrders = await SalesOrder.find()
      .populate('customer', 'name state')
      .populate('salesman', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // 10. Recent Invoices
    const recentInvoices = await Invoice.find({ status: 'Active' })
      .populate('customer', 'name state')
      .sort({ invoiceDate: -1 })
      .limit(5);

    // 11. Recent Stock Ledger Movements
    const recentLedger = await StockLedger.find()
      .sort({ movementDate: -1 })
      .limit(6);

    res.json({
      success: true,
      summary: {
        todaysOrdersCount: todaysOrders.length,
        todaysOrdersValue: todaysOrders.reduce((acc, o) => acc + (o.grandTotal || 0), 0),
        monthlySalesTotal: Math.round(monthlySalesTotal * 100) / 100,
        monthlyProductionUnits,
        totalOutstandingReceivables: Math.round(totalOutstandingReceivables * 100) / 100,
        rawMaterialValuation: Math.round(rawMaterialValuation * 100) / 100,
        totalFinishedGoodsStock: products.reduce((acc, p) => acc + p.currentStock, 0),
      },
      alerts: {
        lowStockProductsCount: lowStockProducts.length,
        lowStockRawMaterialsCount: lowStockRawMaterials.length,
        lowStockPackagingCount: lowStockPackaging.length,
        varianceAlertsCount: varianceAlertRuns.length,
        lowStockItems: [
          ...lowStockProducts.map((p) => ({ type: 'Product', name: p.name, current: p.currentStock, min: p.minStockLevel, unit: p.unit })),
          ...lowStockRawMaterials.map((rm) => ({ type: 'RawMaterial', name: rm.name, current: rm.currentStock, min: rm.reorderLevel, unit: rm.unit })),
          ...lowStockPackaging.map((pm) => ({ type: 'Packaging', name: pm.name, current: pm.currentStock, min: pm.reorderLevel, unit: pm.unit })),
        ],
        varianceRuns: varianceAlertRuns.map((run) => ({
          runNumber: run.runNumber,
          productName: run.productName,
          yieldVariance: run.yieldVariancePercentage,
          date: run.productionDate,
        })),
      },
      recentData: {
        recentOrders,
        recentInvoices,
        recentLedger,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
};
