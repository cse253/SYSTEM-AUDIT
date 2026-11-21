const Product = require('../models/Product');
const RawMaterial = require('../models/RawMaterial');
const PackagingMaterial = require('../models/PackagingMaterial');
const SalesOrder = require('../models/SalesOrder');
const Invoice = require('../models/Invoice');
const ProductionRun = require('../models/ProductionRun');
const Customer = require('../models/Customer');
const StockLedger = require('../models/StockLedger');
const Payment = require('../models/Payment');

// @desc    Get comprehensive dashboard summary metrics with role-specific data
// @route   GET /api/dashboard/summary
// @access  Protected
const getDashboardSummary = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const userRole = req.user ? req.user.role : 'owner';
    const userId = req.user ? req.user._id : null;

    // 1. Orders
    const todaysOrders = await SalesOrder.find({
      $or: [
        { createdAt: { $gte: today } },
        { orderDate: { $gte: today } },
      ],
    }).populate('customer', 'name state');

    const totalOrdersCount = await SalesOrder.countDocuments();
    const allOrders = await SalesOrder.find()
      .populate('customer', 'name state')
      .populate('salesman', 'name')
      .sort({ createdAt: -1 });

    // 2. Invoiced Sales
    const monthlyInvoices = await Invoice.find({
      invoiceDate: { $gte: firstDayOfMonth },
      status: 'Active',
    });
    const monthlySalesTotal = monthlyInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);

    const allInvoices = await Invoice.find({ status: 'Active' })
      .populate('customer', 'name state')
      .sort({ invoiceDate: -1 });
    const totalSalesTotal = allInvoices.reduce((acc, inv) => acc + (inv.grandTotal || 0), 0);
    const totalTaxable = allInvoices.reduce((acc, inv) => acc + (inv.taxableAmount || 0), 0);
    const totalCgst = allInvoices.reduce((acc, inv) => acc + (inv.totalCgst || 0), 0);
    const totalSgst = allInvoices.reduce((acc, inv) => acc + (inv.totalSgst || 0), 0);
    const totalIgst = allInvoices.reduce((acc, inv) => acc + (inv.totalIgst || 0), 0);

    // 3. Total Production
    const monthlyProductionRuns = await ProductionRun.find({
      productionDate: { $gte: firstDayOfMonth },
      status: 'Completed',
    });
    const monthlyProductionUnits = monthlyProductionRuns.reduce((acc, run) => acc + (run.actualOutput || 0), 0);

    const allProductionRuns = await ProductionRun.find({ status: 'Completed' }).sort({ productionDate: -1 });
    const totalProductionUnits = allProductionRuns.reduce((acc, run) => acc + (run.actualOutput || 0), 0);

    // 4. Products & Finished Goods Inventory
    const products = await Product.find({ isActive: true });
    const lowStockProducts = products.filter((p) => p.currentStock <= p.minStockLevel);
    const totalFinishedGoodsStock = products.reduce((acc, p) => acc + p.currentStock, 0);

    // 5. Raw Materials & Valuation
    const rawMaterials = await RawMaterial.find({ isActive: true });
    const lowStockRawMaterials = rawMaterials.filter((rm) => rm.currentStock <= rm.reorderLevel);
    const rawMaterialValuation = rawMaterials.reduce((acc, rm) => acc + (rm.currentStock * rm.valuationRate), 0);

    // 6. Packaging Materials
    const packagingMaterials = await PackagingMaterial.find({ isActive: true });
    const lowStockPackaging = packagingMaterials.filter((pm) => pm.currentStock <= pm.reorderLevel);

    // 7. Outstanding Receivables
    const customers = await Customer.find({ isActive: true });
    const totalOutstandingReceivables = customers.reduce((acc, c) => acc + (c.outstandingBalance || 0), 0);

    // 8. Payments & Collections
    const allPayments = await Payment.find().populate('customer', 'name').sort({ paymentDate: -1 });
    const totalCollections = allPayments.reduce((acc, p) => acc + (p.amount || 0), 0);

    // 9. Variance Alerts (Runs where yield or RM consumption variance exceeded 3%)
    const varianceAlertRuns = await ProductionRun.find({
      $or: [
        { isYieldFlagged: true },
        { 'rawMaterials.isVarianceFlagged': true },
      ],
    })
      .sort({ productionDate: -1 })
      .limit(5);

    // 10. Recent Transactions
    const recentOrders = allOrders.slice(0, 5);
    const recentInvoices = allInvoices.slice(0, 5);
    const recentLedger = await StockLedger.find().sort({ movementDate: -1 }).limit(6);
    const recentPayments = allPayments.slice(0, 5);

    // Role-specific datasets
    let roleData = {};

    if (userRole === 'salesman') {
      const myOrders = allOrders.filter(
        (o) => o.salesman && o.salesman._id && userId && o.salesman._id.toString() === userId.toString()
      );
      roleData = {
        myOrdersCount: myOrders.length,
        myOrdersValue: myOrders.reduce((acc, o) => acc + (o.grandTotal || 0), 0),
        myOrders: myOrders.slice(0, 5),
        availableProducts: products.map((p) => ({
          _id: p._id,
          name: p.name,
          sku: p.sku,
          sellingPrice: p.sellingPrice,
          currentStock: p.currentStock,
          unit: p.unit,
        })),
        customerCount: customers.length,
      };
    } else if (userRole === 'production_supervisor') {
      roleData = {
        totalRunsCount: allProductionRuns.length,
        recentRuns: allProductionRuns.slice(0, 5),
        rawMaterialsList: rawMaterials.map((rm) => ({
          name: rm.name,
          code: rm.code,
          currentStock: rm.currentStock,
          reorderLevel: rm.reorderLevel,
          unit: rm.unit,
          isLowStock: rm.currentStock <= rm.reorderLevel,
        })),
        packagingList: packagingMaterials.map((pm) => ({
          name: pm.name,
          code: pm.code,
          currentStock: pm.currentStock,
          reorderLevel: pm.reorderLevel,
          unit: pm.unit,
          isLowStock: pm.currentStock <= pm.reorderLevel,
        })),
      };
    } else if (userRole === 'accountant_auditor') {
      roleData = {
        taxableTurnover: Math.round(totalTaxable * 100) / 100,
        totalCgst: Math.round(totalCgst * 100) / 100,
        totalSgst: Math.round(totalSgst * 100) / 100,
        totalIgst: Math.round(totalIgst * 100) / 100,
        totalGstCollected: Math.round((totalCgst + totalSgst + totalIgst) * 100) / 100,
        totalCollections: Math.round(totalCollections * 100) / 100,
        recentPayments,
      };
    } else if (userRole === 'admin') {
      const pendingApprovalOrders = allOrders.filter((o) => o.status === 'Submitted');
      const approvedPendingDispatch = allOrders.filter((o) => o.status === 'Approved');
      const unpaidInvoices = allInvoices.filter((i) => i.paymentStatus !== 'Paid');
      roleData = {
        pendingOrdersCount: pendingApprovalOrders.length,
        readyToDispatchCount: approvedPendingDispatch.length,
        unpaidInvoicesCount: unpaidInvoices.length,
        pendingOrders: pendingApprovalOrders.slice(0, 5),
      };
    }

    res.json({
      success: true,
      userRole,
      summary: {
        todaysOrdersCount: todaysOrders.length,
        todaysOrdersValue: todaysOrders.reduce((acc, o) => acc + (o.grandTotal || 0), 0),
        totalOrdersCount,
        monthlySalesTotal: Math.round(monthlySalesTotal * 100) / 100,
        totalSalesTotal: Math.round(totalSalesTotal * 100) / 100,
        monthlyProductionUnits,
        totalProductionUnits,
        totalOutstandingReceivables: Math.round(totalOutstandingReceivables * 100) / 100,
        rawMaterialValuation: Math.round(rawMaterialValuation * 100) / 100,
        totalFinishedGoodsStock,
        totalCollections: Math.round(totalCollections * 100) / 100,
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
      gstSummary: {
        taxableTurnover: Math.round(totalTaxable * 100) / 100,
        cgst: Math.round(totalCgst * 100) / 100,
        sgst: Math.round(totalSgst * 100) / 100,
        igst: Math.round(totalIgst * 100) / 100,
        totalGst: Math.round((totalCgst + totalSgst + totalIgst) * 100) / 100,
      },
      roleData,
      recentData: {
        recentOrders,
        recentInvoices,
        recentLedger,
        recentPayments,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
};
