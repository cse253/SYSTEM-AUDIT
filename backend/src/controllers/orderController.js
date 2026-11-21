const SalesOrder = require('../models/SalesOrder');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const StockLedger = require('../models/StockLedger');
const AuditLog = require('../models/AuditLog');
const { calculateGST } = require('../services/gstService');

// Helper to generate sequential order number
const generateOrderNumber = async () => {
  const year = new Date().getFullYear();
  let nextSeq = (await SalesOrder.countDocuments()) + 1;
  while (await SalesOrder.exists({ orderNumber: `SO-${year}-${String(nextSeq).padStart(4, '0')}` })) {
    nextSeq++;
  }
  return `SO-${year}-${String(nextSeq).padStart(4, '0')}`;
};

// @desc    Create new sales order
// @route   POST /api/orders
// @access  Private (Salesman, Admin, Owner)
const createOrder = async (req, res, next) => {
  try {
    const { customerId, items, remarks } = req.body;

    if (!customerId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Customer and at least one item are required' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Enrich line items with product catalog info and customer pricing
    const enrichedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
      }

      // Check if customer has specific pricing for this product
      let unitPrice = Number(item.unitPrice);
      if (!unitPrice) {
        const customPriceObj = customer.customerPricing?.find(
          (cp) => cp.product.toString() === product._id.toString()
        );
        unitPrice = customPriceObj ? customPriceObj.customPrice : product.sellingPrice;
      }

      enrichedItems.push({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        hsnCode: product.hsnCode,
        quantity: Number(item.quantity),
        unit: product.unit || 'packets',
        unitPrice,
        gstPercentage: product.gstPercentage,
      });
    }

    // Calculate GST using service
    const taxCalculation = calculateGST(enrichedItems, customer.state, customer.stateCode);

    const orderNumber = await generateOrderNumber();

    const order = await SalesOrder.create({
      orderNumber,
      customer: customer._id,
      salesman: req.user._id,
      items: taxCalculation.items,
      subtotal: taxCalculation.taxableAmount,
      totalTax: taxCalculation.totalTax,
      grandTotal: taxCalculation.grandTotal,
      isInterState: taxCalculation.isInterState,
      status: 'Submitted',
      remarks: remarks || '',
    });

    await AuditLog.create({
      action: 'SALES_ORDER_SUBMITTED',
      entity: 'SalesOrder',
      entityId: order._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: { orderNumber: order.orderNumber, grandTotal: order.grandTotal, customer: customer.name },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Sales order submitted successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sales orders with stock checks
// @route   GET /api/orders
// @access  Protected
const getOrders = async (req, res, next) => {
  try {
    const { status, customerId, salesmanId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (customerId) query.customer = customerId;
    if (salesmanId) query.salesman = salesmanId;

    // If salesman role, restrict to their own orders unless viewing all
    if (req.user.role === 'salesman' && !salesmanId) {
      query.salesman = req.user._id;
    }

    const orders = await SalesOrder.find(query)
      .populate('customer', 'name customerType state stateCode gstin phone')
      .populate('salesman', 'name email')
      .populate('invoice', 'invoiceNumber paymentStatus')
      .sort({ createdAt: -1 });

    // Attach dynamic stock availability status to each order
    const products = await Product.find();
    const productStockMap = {};
    products.forEach((p) => {
      productStockMap[p._id.toString()] = p.currentStock;
    });

    const ordersWithStock = orders.map((order) => {
      const orderObj = order.toObject();
      let hasShortage = false;
      const shortages = [];

      orderObj.items.forEach((item) => {
        const available = productStockMap[item.product.toString()] || 0;
        const requested = item.quantity;
        if (available < requested) {
          hasShortage = true;
          shortages.push({
            productName: item.productName,
            sku: item.sku,
            requested,
            available,
            shortage: requested - available,
          });
        }
      });

      orderObj.stockStatus = {
        canFulfill: !hasShortage,
        shortages,
      };

      return orderObj;
    });

    res.json({
      success: true,
      count: ordersWithStock.length,
      orders: ordersWithStock,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sales order
// @route   GET /api/orders/:id
// @access  Protected
const getOrderById = async (req, res, next) => {
  try {
    const order = await SalesOrder.findById(req.params.id)
      .populate('customer', 'name customerType state stateCode gstin phone address')
      .populate('salesman', 'name email phone')
      .populate('approvedBy', 'name')
      .populate('invoice');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Sales order not found' });
    }

    // Check stock for order items
    const shortages = [];
    let isSufficient = true;

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      const available = product ? product.currentStock : 0;
      if (available < item.quantity) {
        isSufficient = false;
        shortages.push({
          productName: item.productName,
          sku: item.sku,
          requested: item.quantity,
          available,
          shortage: item.quantity - available,
        });
      }
    }

    const orderObj = order.toObject();
    orderObj.stockStatus = {
      isSufficient,
      shortages,
    };

    res.json({ success: true, order: orderObj });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve sales order
// @route   PUT /api/orders/:id/approve
// @access  Private (Admin, Owner)
const approveOrder = async (req, res, next) => {
  try {
    const order = await SalesOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'Submitted') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve order currently in '${order.status}' status`,
      });
    }

    order.status = 'Approved';
    order.approvedBy = req.user._id;
    order.approvedAt = new Date();
    await order.save();

    await AuditLog.create({
      action: 'SALES_ORDER_APPROVED',
      entity: 'SalesOrder',
      entityId: order._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: { orderNumber: order.orderNumber },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Sales order approved successfully', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject sales order
// @route   PUT /api/orders/:id/reject
// @access  Private (Admin, Owner)
const rejectOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await SalesOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = 'Rejected';
    order.rejectedBy = req.user._id;
    order.rejectionReason = reason || 'Rejected by Admin';
    await order.save();

    await AuditLog.create({
      action: 'SALES_ORDER_REJECTED',
      entity: 'SalesOrder',
      entityId: order._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: { orderNumber: order.orderNumber, reason: order.rejectionReason },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Sales order rejected', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Record dispatch and deduct inventory atomically
// @route   POST /api/orders/:id/dispatch
// @access  Private (Admin, Owner)
const dispatchOrder = async (req, res, next) => {
  try {
    const order = await SalesOrder.findById(req.params.id).populate('customer');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'Dispatched') {
      return res.status(400).json({ success: false, message: 'Order is already dispatched' });
    }

    // MANDATORY REQUIREMENT: Prevent dispatch when available stock is insufficient!
    const shortages = [];
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product || product.currentStock < item.quantity) {
        const available = product ? product.currentStock : 0;
        shortages.push({
          productName: item.productName,
          sku: item.sku,
          requested: item.quantity,
          available,
          shortage: item.quantity - available,
        });
      }
    }

    if (shortages.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot dispatch order: Insufficient finished-goods stock.',
        shortages,
      });
    }

    // Stock is sufficient! Deduct finished-goods stock and record in StockLedger atomically
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      const balanceBefore = product.currentStock;
      const balanceAfter = balanceBefore - item.quantity;

      // Update product currentStock
      product.currentStock = balanceAfter;
      await product.save();

      // Record immutable StockLedger entry
      await StockLedger.create({
        itemType: 'Product',
        item: product._id,
        itemName: product.name,
        itemCategory: 'finished_goods',
        movementType: 'SALES_DISPATCH',
        direction: -1,
        quantity: item.quantity,
        unit: item.unit || 'packets',
        unitRate: item.unitPrice,
        totalValue: item.taxableAmount,
        balanceBefore,
        balanceAfter,
        sourceDocumentType: 'SalesOrder',
        sourceDocumentId: order._id,
        sourceDocumentNumber: order.orderNumber,
        remarks: `Sales dispatch to ${order.customer?.name} (Order #${order.orderNumber})`,
        user: req.user._id,
      });
    }

    order.status = 'Dispatched';
    order.dispatchedAt = new Date();
    await order.save();

    await AuditLog.create({
      action: 'SALES_ORDER_DISPATCHED',
      entity: 'SalesOrder',
      entityId: order._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: { orderNumber: order.orderNumber, customer: order.customer?.name },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Order dispatched successfully. Finished-goods stock deducted.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  approveOrder,
  rejectOrder,
  dispatchOrder,
};
