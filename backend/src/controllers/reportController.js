const Invoice = require('../models/Invoice');
const SalesOrder = require('../models/SalesOrder');
const Purchase = require('../models/Purchase');
const ProductionRun = require('../models/ProductionRun');
const StockLedger = require('../models/StockLedger');
const RawMaterial = require('../models/RawMaterial');
const PackagingMaterial = require('../models/PackagingMaterial');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');

// Helper to extract date filter from query
const getDateFilter = (startDate, endDate, dateField = 'createdAt') => {
  const filter = {};
  if (startDate || endDate) {
    filter[dateField] = {};
    if (startDate) filter[dateField].$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter[dateField].$lte = end;
    }
  }
  return filter;
};

// 1. Sales Register
const getSalesRegister = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { status: 'Active', ...getDateFilter(startDate, endDate, 'invoiceDate') };

    const invoices = await Invoice.find(query).sort({ invoiceDate: -1 });
    const data = invoices.map((inv) => ({
      invoiceNumber: inv.invoiceNumber,
      date: new Date(inv.invoiceDate).toLocaleDateString('en-IN'),
      customerName: inv.customerName,
      customerState: inv.customerState,
      stateCode: inv.customerStateCode,
      taxableAmount: inv.taxableAmount,
      cgstTotal: inv.cgstTotal,
      sgstTotal: inv.sgstTotal,
      igstTotal: inv.igstTotal,
      grandTotal: inv.grandTotal,
      paymentStatus: inv.paymentStatus,
    }));

    res.json({ success: true, count: data.length, reportType: 'Sales Register', data });
  } catch (err) {
    next(err);
  }
};

// 2. Customer-wise Sales
const getCustomerWiseSales = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { status: 'Active', ...getDateFilter(startDate, endDate, 'invoiceDate') };

    const invoices = await Invoice.find(query);
    const map = {};

    invoices.forEach((inv) => {
      const name = inv.customerName;
      if (!map[name]) {
        map[name] = {
          customerName: name,
          state: inv.customerState,
          invoiceCount: 0,
          taxableAmount: 0,
          cgstTotal: 0,
          sgstTotal: 0,
          igstTotal: 0,
          grandTotal: 0,
        };
      }
      map[name].invoiceCount += 1;
      map[name].taxableAmount += inv.taxableAmount;
      map[name].cgstTotal += inv.cgstTotal;
      map[name].sgstTotal += inv.sgstTotal;
      map[name].igstTotal += inv.igstTotal;
      map[name].grandTotal += inv.grandTotal;
    });

    const data = Object.values(map).map((c) => ({
      ...c,
      taxableAmount: Math.round(c.taxableAmount * 100) / 100,
      grandTotal: Math.round(c.grandTotal * 100) / 100,
    }));

    res.json({ success: true, count: data.length, reportType: 'Customer-wise Sales', data });
  } catch (err) {
    next(err);
  }
};

// 3. Product-wise Sales
const getProductWiseSales = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { status: 'Active', ...getDateFilter(startDate, endDate, 'invoiceDate') };

    const invoices = await Invoice.find(query);
    const map = {};

    invoices.forEach((inv) => {
      inv.items.forEach((item) => {
        const name = item.description;
        if (!map[name]) {
          map[name] = {
            productName: name,
            hsnCode: item.hsnCode,
            quantitySold: 0,
            unit: item.unit,
            taxableRevenue: 0,
            totalTax: 0,
            totalRevenue: 0,
          };
        }
        map[name].quantitySold += item.quantity;
        map[name].taxableRevenue += item.taxableAmount;
        map[name].totalTax += item.cgstAmount + item.sgstAmount + item.igstAmount;
        map[name].totalRevenue += item.totalAmount;
      });
    });

    const data = Object.values(map).map((p) => ({
      ...p,
      taxableRevenue: Math.round(p.taxableRevenue * 100) / 100,
      totalRevenue: Math.round(p.totalRevenue * 100) / 100,
    }));

    res.json({ success: true, count: data.length, reportType: 'Product-wise Sales', data });
  } catch (err) {
    next(err);
  }
};

// 4. GST Summary
const getGSTSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = { status: 'Active', ...getDateFilter(startDate, endDate, 'invoiceDate') };

    const invoices = await Invoice.find(query);
    let intraTaxable = 0;
    let intraCGST = 0;
    let intraSGST = 0;
    let interTaxable = 0;
    let interIGST = 0;

    invoices.forEach((inv) => {
      if (inv.isInterState) {
        interTaxable += inv.taxableAmount;
        interIGST += inv.igstTotal;
      } else {
        intraTaxable += inv.taxableAmount;
        intraCGST += inv.cgstTotal;
        intraSGST += inv.sgstTotal;
      }
    });

    const data = [
      {
        taxType: 'Intra-State (Tamil Nadu 33)',
        taxableValue: Math.round(intraTaxable * 100) / 100,
        cgst: Math.round(intraCGST * 100) / 100,
        sgst: Math.round(intraSGST * 100) / 100,
        igst: 0,
        totalTax: Math.round((intraCGST + intraSGST) * 100) / 100,
        invoiceTotal: Math.round((intraTaxable + intraCGST + intraSGST) * 100) / 100,
      },
      {
        taxType: 'Inter-State (e.g. Karnataka 29)',
        taxableValue: Math.round(interTaxable * 100) / 100,
        cgst: 0,
        sgst: 0,
        igst: Math.round(interIGST * 100) / 100,
        totalTax: Math.round(interIGST * 100) / 100,
        invoiceTotal: Math.round((interTaxable + interIGST) * 100) / 100,
      },
    ];

    res.json({ success: true, reportType: 'GST Summary', data });
  } catch (err) {
    next(err);
  }
};

// 5. Purchase Register
const getPurchaseRegister = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = getDateFilter(startDate, endDate, 'purchaseDate');

    const purchases = await Purchase.find(query).populate('supplier').sort({ purchaseDate: -1 });
    const data = purchases.map((p) => ({
      purchaseNumber: p.purchaseNumber,
      billNumber: p.invoiceNumber || '-',
      date: new Date(p.purchaseDate).toLocaleDateString('en-IN'),
      supplier: p.supplier?.name || 'Vendor',
      state: p.supplier?.state || 'Tamil Nadu',
      itemsCount: p.items?.length || 0,
      taxableAmount: p.subtotal,
      tax: p.totalTax,
      grandTotal: p.grandTotal,
    }));

    res.json({ success: true, count: data.length, reportType: 'Purchase Register', data });
  } catch (err) {
    next(err);
  }
};

// 6. Raw Material Stock Report
const getRawMaterialStock = async (req, res, next) => {
  try {
    const materials = await RawMaterial.find({ isActive: true }).sort({ name: 1 });
    const data = materials.map((m) => ({
      code: m.code,
      name: m.name,
      category: m.category,
      currentStock: m.currentStock,
      unit: m.unit,
      valuationRate: m.valuationRate,
      totalValuation: Math.round(m.currentStock * m.valuationRate * 100) / 100,
      reorderLevel: m.reorderLevel,
      status: m.currentStock <= m.reorderLevel ? 'LOW STOCK ALERT' : 'Normal',
    }));

    res.json({ success: true, count: data.length, reportType: 'Raw Material Stock Report', data });
  } catch (err) {
    next(err);
  }
};

// 7. Packaging Material Stock Report
const getPackagingStock = async (req, res, next) => {
  try {
    const materials = await PackagingMaterial.find({ isActive: true }).sort({ name: 1 });
    const data = materials.map((m) => ({
      code: m.code,
      name: m.name,
      currentStock: m.currentStock,
      unit: m.unit,
      valuationRate: m.valuationRate,
      totalValuation: Math.round(m.currentStock * m.valuationRate * 100) / 100,
      reorderLevel: m.reorderLevel,
      status: m.currentStock <= m.reorderLevel ? 'REORDER ALERT' : 'Normal',
    }));

    res.json({ success: true, count: data.length, reportType: 'Packaging Material Stock Report', data });
  } catch (err) {
    next(err);
  }
};

// 8. Finished Goods Stock Report
const getFinishedGoodsStock = async (req, res, next) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ name: 1 });
    const data = products.map((p) => ({
      sku: p.sku,
      name: p.name,
      category: p.category,
      packSize: `${p.packSize} ${p.packUnit}`,
      currentStock: p.currentStock,
      unit: p.unit,
      sellingPrice: p.sellingPrice,
      totalValue: Math.round(p.currentStock * p.sellingPrice * 100) / 100,
      minStockLevel: p.minStockLevel,
      status: p.currentStock <= p.minStockLevel ? 'LOW STOCK' : 'Adequate',
    }));

    res.json({ success: true, count: data.length, reportType: 'Finished Goods Stock Report', data });
  } catch (err) {
    next(err);
  }
};

// 9. Stock Movement Ledger
const getStockMovementLedger = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = getDateFilter(startDate, endDate, 'movementDate');

    const ledger = await StockLedger.find(query).populate('user').sort({ movementDate: -1 });
    const data = ledger.map((l) => ({
      date: new Date(l.movementDate).toLocaleString('en-IN'),
      itemName: l.itemName,
      itemCategory: l.itemCategory,
      movementType: l.movementType,
      quantity: `${l.direction > 0 ? '+' : '-'}${l.quantity} ${l.unit}`,
      unitRate: l.unitRate,
      balanceBefore: l.balanceBefore,
      balanceAfter: l.balanceAfter,
      sourceDoc: l.sourceDocumentNumber || l.sourceDocumentType,
      performedBy: l.user?.name || 'System',
    }));

    res.json({ success: true, count: data.length, reportType: 'Stock Movement Ledger', data });
  } catch (err) {
    next(err);
  }
};

// 10. Production Report
const getProductionReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = getDateFilter(startDate, endDate, 'productionDate');

    const runs = await ProductionRun.find(query).populate('supervisor').sort({ productionDate: -1 });
    const data = runs.map((r) => ({
      runNumber: r.runNumber,
      date: new Date(r.productionDate).toLocaleDateString('en-IN'),
      product: r.productName,
      expectedOutput: r.expectedOutput,
      actualOutput: r.actualOutput,
      unit: r.unit,
      yieldVariance: `${r.yieldVariancePercentage}%`,
      isFlagged: r.isYieldFlagged ? 'FLAGGED (>3%)' : 'Normal',
      totalCost: r.totalProductionCost,
      costPerPacket: r.costPerPacket,
      supervisor: r.supervisor?.name || 'Supervisor',
    }));

    res.json({ success: true, count: data.length, reportType: 'Production Report', data });
  } catch (err) {
    next(err);
  }
};

// 11. Planned vs Actual Consumption Report
const getConsumptionReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = getDateFilter(startDate, endDate, 'productionDate');

    const runs = await ProductionRun.find(query).sort({ productionDate: -1 });
    const data = [];

    runs.forEach((r) => {
      r.rawMaterials.forEach((rm) => {
        data.push({
          runNumber: r.runNumber,
          date: new Date(r.productionDate).toLocaleDateString('en-IN'),
          productName: r.productName,
          material: rm.materialName,
          plannedQty: `${rm.plannedQuantity} ${rm.unit}`,
          actualQty: `${rm.actualQuantity} ${rm.unit}`,
          varianceQty: `${rm.varianceQuantity} ${rm.unit}`,
          variancePercentage: `${rm.variancePercentage}%`,
          status: rm.isVarianceFlagged ? 'ALERT (>3% VARIANCE)' : 'Normal',
        });
      });
    });

    res.json({ success: true, count: data.length, reportType: 'Planned vs Actual Consumption Report', data });
  } catch (err) {
    next(err);
  }
};

// 12. Wastage & Damage Report
const getWastageReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = getDateFilter(startDate, endDate, 'productionDate');

    const runs = await ProductionRun.find(query).sort({ productionDate: -1 });
    const data = [];

    runs.forEach((r) => {
      const lostOutput = Math.max(0, r.expectedOutput - r.actualOutput);
      r.packagingMaterials.forEach((pm) => {
        if (pm.damagedQuantity > 0 || lostOutput > 0) {
          data.push({
            runNumber: r.runNumber,
            date: new Date(r.productionDate).toLocaleDateString('en-IN'),
            product: r.productName,
            damagedPackagingItem: pm.materialName,
            damagedPackagingQty: `${pm.damagedQuantity} ${pm.unit}`,
            yieldLossPackets: lostOutput,
            scrapReason: 'Production seal / handling defect',
          });
        }
      });
    });

    res.json({ success: true, count: data.length, reportType: 'Wastage & Damage Report', data });
  } catch (err) {
    next(err);
  }
};

// 13. Cost Per Packet Report
const getCostPerPacketReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = getDateFilter(startDate, endDate, 'productionDate');

    const runs = await ProductionRun.find(query).sort({ productionDate: -1 });
    const data = runs.map((r) => ({
      runNumber: r.runNumber,
      product: r.productName,
      packetsProduced: r.actualOutput,
      rawMaterialCost: r.totalRawMaterialCost,
      packagingCost: r.totalPackagingCost,
      labourCost: r.labourCost,
      gasAndPowerCost: r.gasAndElectricityCost,
      totalCost: r.totalProductionCost,
      costPerPacket: r.costPerPacket,
      sellingPrice: r.sellingPricePerPacket,
      profitPerPacket: r.profitPerPacket,
      profitMargin: `${r.profitMarginPercentage}%`,
    }));

    res.json({ success: true, count: data.length, reportType: 'Cost Per Packet & Margin Report', data });
  } catch (err) {
    next(err);
  }
};

// 14. Payment & Collection Report
const getPaymentCollectionReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const query = getDateFilter(startDate, endDate, 'paymentDate');

    const payments = await Payment.find(query).populate('customer').sort({ paymentDate: -1 });
    const data = payments.map((p) => ({
      paymentNumber: p.paymentNumber,
      date: new Date(p.paymentDate).toLocaleDateString('en-IN'),
      customerName: p.customer?.name || 'Customer',
      invoiceNumber: p.invoiceNumber || 'General',
      amount: p.amount,
      mode: p.paymentMode,
      referenceNumber: p.referenceNumber || '-',
    }));

    res.json({ success: true, count: data.length, reportType: 'Payment & Collection Report', data });
  } catch (err) {
    next(err);
  }
};

// 15. Outstanding Receivables & Ageing Report
const getOutstandingAgeingReport = async (req, res, next) => {
  try {
    const unpaidInvoices = await Invoice.find({
      paymentStatus: { $ne: 'Paid' },
      status: 'Active',
    }).populate('customer');

    const now = new Date();
    const data = unpaidInvoices.map((inv) => {
      const days = Math.floor((now - new Date(inv.invoiceDate)) / (1000 * 60 * 60 * 24));
      let bucket = '0 - 30 Days';
      if (days > 90) bucket = '> 90 Days';
      else if (days > 60) bucket = '61 - 90 Days';
      else if (days > 30) bucket = '31 - 60 Days';

      return {
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: new Date(inv.invoiceDate).toLocaleDateString('en-IN'),
        customerName: inv.customerName,
        customerType: inv.customer?.customerType || 'Retailer',
        state: inv.customerState,
        grandTotal: inv.grandTotal,
        amountPaid: inv.amountPaid,
        balanceDue: inv.balanceDue,
        ageInDays: `${days} days`,
        ageingBucket: bucket,
      };
    });

    res.json({ success: true, count: data.length, reportType: 'Outstanding Receivables with Ageing Report', data });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSalesRegister,
  getCustomerWiseSales,
  getProductWiseSales,
  getGSTSummary,
  getPurchaseRegister,
  getRawMaterialStock,
  getPackagingStock,
  getFinishedGoodsStock,
  getStockMovementLedger,
  getProductionReport,
  getConsumptionReport,
  getWastageReport,
  getCostPerPacketReport,
  getPaymentCollectionReport,
  getOutstandingAgeingReport,
};
