const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const AuditLog = require('../models/AuditLog');

// Helper to generate sequential payment number
const generatePaymentNumber = async () => {
  const year = new Date().getFullYear();
  let nextSeq = (await Payment.countDocuments()) + 1;
  while (await Payment.exists({ paymentNumber: `PAY-${year}-${String(nextSeq).padStart(4, '0')}` })) {
    nextSeq++;
  }
  return `PAY-${year}-${String(nextSeq).padStart(4, '0')}`;
};

// @desc    Record customer payment (supporting partial payments)
// @route   POST /api/payments
// @access  Private (Admin, Owner)
const recordPayment = async (req, res, next) => {
  try {
    const { customerId, invoiceId, amount, paymentMode, referenceNumber, paymentDate, remarks } = req.body;

    const payAmount = Number(amount);
    if (!customerId || !payAmount || payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid customer and positive payment amount are required' });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    let invoice = null;
    if (invoiceId) {
      invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found' });
      }
      if (payAmount > invoice.balanceDue) {
        return res.status(400).json({
          success: false,
          message: `Payment amount ₹${payAmount.toFixed(2)} exceeds invoice balance due of ₹${invoice.balanceDue.toFixed(2)}`,
        });
      }
    } else {
      // Find oldest unpaid invoice for this customer if none specified
      invoice = await Invoice.findOne({ customer: customer._id, paymentStatus: { $ne: 'Paid' }, status: 'Active' })
        .sort({ invoiceDate: 1 });

      if (!invoice && customer.outstandingBalance > 0 && payAmount > customer.outstandingBalance) {
        return res.status(400).json({
          success: false,
          message: `Payment amount ₹${payAmount.toFixed(2)} exceeds customer total outstanding balance of ₹${customer.outstandingBalance.toFixed(2)}`,
        });
      }
    }

    const paymentNumber = await generatePaymentNumber();

    // 1. Update Invoice if linked
    if (invoice) {
      const newAmountPaid = Math.round((invoice.amountPaid + payAmount) * 100) / 100;
      const newBalanceDue = Math.max(0, Math.round((invoice.grandTotal - newAmountPaid) * 100) / 100);

      invoice.amountPaid = newAmountPaid;
      invoice.balanceDue = newBalanceDue;

      if (newBalanceDue === 0) {
        invoice.paymentStatus = 'Paid';
      } else {
        invoice.paymentStatus = 'Partially Paid';
      }
      await invoice.save();
    }

    // 2. Update Customer Outstanding Balance
    customer.outstandingBalance = Math.max(
      0,
      Math.round((customer.outstandingBalance - payAmount) * 100) / 100
    );
    await customer.save();

    // 3. Create Payment Record
    const payment = await Payment.create({
      paymentNumber,
      customer: customer._id,
      invoice: invoice ? invoice._id : null,
      invoiceNumber: invoice ? invoice.invoiceNumber : '',
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      amount: payAmount,
      paymentMode: paymentMode || 'NEFT',
      referenceNumber: referenceNumber || '',
      recordedBy: req.user._id,
      remarks: remarks || '',
    });

    await AuditLog.create({
      action: 'PAYMENT_RECORDED',
      entity: 'Payment',
      entityId: payment._id,
      performedBy: req.user._id,
      userName: req.user.name,
      details: {
        paymentNumber: payment.paymentNumber,
        customer: customer.name,
        amount: payment.amount,
        invoiceNumber: invoice ? invoice.invoiceNumber : 'General',
        newCustomerBalance: customer.outstandingBalance,
      },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded and balance reconciled successfully',
      payment,
      customerOutstanding: customer.outstandingBalance,
      invoiceBalanceDue: invoice ? invoice.balanceDue : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments history
// @route   GET /api/payments
// @access  Protected
const getPayments = async (req, res, next) => {
  try {
    const { customerId } = req.query;
    const query = {};
    if (customerId) query.customer = customerId;

    const payments = await Payment.find(query)
      .populate('customer', 'name customerType state gstin phone')
      .populate('invoice', 'invoiceNumber grandTotal')
      .populate('recordedBy', 'name')
      .sort({ paymentDate: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Customer Receivables with Ageing Analysis (0-30, 31-60, 61-90, 90+ days)
// @route   GET /api/payments/ageing
// @access  Protected
const getReceivablesAgeing = async (req, res, next) => {
  try {
    const unpaidInvoices = await Invoice.find({
      paymentStatus: { $ne: 'Paid' },
      status: 'Active',
    }).populate('customer');

    const now = new Date();
    const customerMap = {};

    let totalOutstanding = 0;
    let total0to30 = 0;
    let total31to60 = 0;
    let total61to90 = 0;
    let total90Plus = 0;

    for (const inv of unpaidInvoices) {
      const cId = inv.customer?._id?.toString() || 'unknown';
      const cName = inv.customerName || inv.customer?.name || 'Customer';

      if (!customerMap[cId]) {
        customerMap[cId] = {
          customerId: cId,
          customerName: cName,
          customerType: inv.customer?.customerType || 'Retailer',
          state: inv.customerState || inv.customer?.state,
          totalDue: 0,
          current0to30: 0,
          days31to60: 0,
          days61to90: 0,
          days90Plus: 0,
          invoicesCount: 0,
        };
      }

      const balance = inv.balanceDue;
      const daysOld = Math.floor((now - new Date(inv.invoiceDate)) / (1000 * 60 * 60 * 24));

      customerMap[cId].totalDue += balance;
      customerMap[cId].invoicesCount += 1;
      totalOutstanding += balance;

      if (daysOld <= 30) {
        customerMap[cId].current0to30 += balance;
        total0to30 += balance;
      } else if (daysOld <= 60) {
        customerMap[cId].days31to60 += balance;
        total31to60 += balance;
      } else if (daysOld <= 90) {
        customerMap[cId].days61to90 += balance;
        total61to90 += balance;
      } else {
        customerMap[cId].days90Plus += balance;
        total90Plus += balance;
      }
    }

    const customers = Object.values(customerMap).map((c) => ({
      ...c,
      totalDue: Math.round(c.totalDue * 100) / 100,
      current0to30: Math.round(c.current0to30 * 100) / 100,
      days31to60: Math.round(c.days31to60 * 100) / 100,
      days61to90: Math.round(c.days61to90 * 100) / 100,
      days90Plus: Math.round(c.days90Plus * 100) / 100,
    }));

    res.json({
      success: true,
      summary: {
        totalOutstanding: Math.round(totalOutstanding * 100) / 100,
        total0to30: Math.round(total0to30 * 100) / 100,
        total31to60: Math.round(total31to60 * 100) / 100,
        total61to90: Math.round(total61to90 * 100) / 100,
        total90Plus: Math.round(total90Plus * 100) / 100,
      },
      customers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  recordPayment,
  getPayments,
  getReceivablesAgeing,
};
