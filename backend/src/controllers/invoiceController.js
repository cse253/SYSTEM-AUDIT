const Invoice = require('../models/Invoice');
const SalesOrder = require('../models/SalesOrder');
const Customer = require('../models/Customer');
const AuditLog = require('../models/AuditLog');
const { calculateGST } = require('../services/gstService');

// Helper to generate sequential invoice number
const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Generate GST Invoice from Approved Sales Order
// @route   POST /api/invoices/generate/:orderId
// @access  Private (Admin, Owner)
const generateInvoice = async (req, res, next) => {
  try {
    const order = await SalesOrder.findById(req.params.orderId).populate('customer');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Sales order not found' });
    }

    if (order.status === 'Invoiced' && order.invoice) {
      return res.status(400).json({ success: false, message: 'Invoice already generated for this order' });
    }

    const customer = order.customer;
    const invoiceNumber = await generateInvoiceNumber();

    // Map items from sales order to invoice schema
    const invoiceItems = order.items.map((item) => ({
      product: item.product,
      description: item.productName,
      hsnCode: item.hsnCode || '21069099',
      quantity: item.quantity,
      unit: item.unit || 'packets',
      unitPrice: item.unitPrice,
      taxableAmount: item.taxableAmount,
      gstPercentage: item.gstPercentage,
      cgstRate: item.cgstAmount > 0 ? item.gstPercentage / 2 : 0,
      cgstAmount: item.cgstAmount,
      sgstRate: item.sgstAmount > 0 ? item.gstPercentage / 2 : 0,
      sgstAmount: item.sgstAmount,
      igstRate: item.igstAmount > 0 ? item.gstPercentage : 0,
      igstAmount: item.igstAmount,
      totalAmount: item.totalAmount,
    }));

    const invoice = await Invoice.create({
      invoiceNumber,
      order: order._id,
      customer: customer._id,
      customerName: customer.name,
      customerGstin: customer.gstin || '',
      customerAddress: customer.address,
      customerState: customer.state,
      customerStateCode: customer.stateCode,
      isInterState: order.isInterState,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days credit
      items: invoiceItems,
      taxableAmount: order.subtotal,
      cgstTotal: order.items.reduce((acc, i) => acc + i.cgstAmount, 0),
      sgstTotal: order.items.reduce((acc, i) => acc + i.sgstAmount, 0),
      igstTotal: order.items.reduce((acc, i) => acc + i.igstAmount, 0),
      totalTax: order.totalTax,
      grandTotal: order.grandTotal,
      balanceDue: order.grandTotal,
      amountPaid: 0,
      paymentStatus: 'Unpaid',
      generatedBy: req.user._id,
    });

    // Link invoice to sales order & mark Invoiced
    order.invoice = invoice._id;
    order.status = 'Invoiced';
    await order.save();

    // Update customer outstanding balance
    customer.outstandingBalance = Math.round((customer.outstandingBalance + invoice.grandTotal) * 100) / 100;
    await customer.save();

    await AuditLog.create({
      action: 'GST_INVOICE_GENERATED',
      entity: 'Invoice',
      entityId: invoice._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: {
        invoiceNumber: invoice.invoiceNumber,
        grandTotal: invoice.grandTotal,
        customer: customer.name,
        taxType: invoice.isInterState ? 'IGST' : 'CGST+SGST',
      },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'GST Tax Invoice generated successfully',
      invoice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Protected
const getInvoices = async (req, res, next) => {
  try {
    const { customerId, paymentStatus, startDate, endDate, status } = req.query;
    const query = {};

    if (customerId) query.customer = customerId;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }

    const invoices = await Invoice.find(query)
      .populate('customer', 'name customerType state stateCode gstin phone')
      .populate('order', 'orderNumber status')
      .sort({ invoiceDate: -1 });

    res.json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get invoice by ID
// @route   GET /api/invoices/:id
// @access  Protected
const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer')
      .populate('order')
      .populate('generatedBy', 'name email');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel posted invoice (via cancellation workflow)
// @route   PUT /api/invoices/:id/cancel
// @access  Private (Admin, Owner)
const cancelInvoice = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const invoice = await Invoice.findById(req.params.id).populate('customer');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Invoice is already cancelled' });
    }

    if (invoice.amountPaid > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel invoice with recorded payments. Reverse payments first.',
      });
    }

    invoice.status = 'Cancelled';
    invoice.cancellationReason = cancellationReason || 'Cancelled by Admin';
    invoice.cancelledAt = new Date();
    await invoice.save();

    // Adjust customer outstanding balance
    if (invoice.customer) {
      invoice.customer.outstandingBalance = Math.max(
        0,
        Math.round((invoice.customer.outstandingBalance - invoice.grandTotal) * 100) / 100
      );
      await invoice.customer.save();
    }

    await AuditLog.create({
      action: 'INVOICE_CANCELLED',
      entity: 'Invoice',
      entityId: invoice._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: { invoiceNumber: invoice.invoiceNumber, reason: invoice.cancellationReason },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'Invoice cancelled successfully', invoice });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateInvoice,
  getInvoices,
  getInvoiceById,
  cancelInvoice,
};
