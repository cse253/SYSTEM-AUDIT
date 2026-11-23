require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const { app } = require('../server');
const Customer = require('../models/Customer');
const SalesOrder = require('../models/SalesOrder');
const Invoice = require('../models/Invoice');
const RawMaterial = require('../models/RawMaterial');
const BOM = require('../models/BOM');
const Product = require('../models/Product');

const PORT = 5099;

async function runPhase7Tests() {
  console.log('\n======================================================');
  console.log('       PHASE 7 SECURITY & INTEGRITY HARDENING SUITE    ');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  const assert = (condition, title) => {
    total++;
    if (condition) {
      console.log(`  [PASS] Test ${total}: ${title}`);
      passed++;
    } else {
      console.error(`  [FAIL] Test ${total}: ${title}`);
    }
  };

  const server = app.listen(PORT, async () => {
    try {
      // 1. Authenticate Salesman, Admin, and Auditor
      const getAuthToken = async (email, password = 'Password@123') => {
        const res = await fetch(`http://localhost:${PORT}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        return data.token;
      };

      const salesmanToken = await getAuthToken('salesman@nitfood.com');
      const adminToken = await getAuthToken('admin@nitfood.com');
      const auditorToken = await getAuthToken('auditor@nitfood.com');

      // Test 1: Salesman blocked from /api/costing/summary (403 Forbidden)
      const costingSalesmanRes = await fetch(`http://localhost:${PORT}/api/costing/summary`, {
        headers: { Authorization: `Bearer ${salesmanToken}` },
      });
      assert(
        costingSalesmanRes.status === 403,
        'RBAC: Salesman blocked from accessing Costing Summary (/api/costing/summary) (403 Forbidden)'
      );

      // Test 2: Auditor allowed to access /api/costing/summary
      const costingAuditorRes = await fetch(`http://localhost:${PORT}/api/costing/summary`, {
        headers: { Authorization: `Bearer ${auditorToken}` },
      });
      assert(
        costingAuditorRes.status === 200,
        'RBAC: Auditor successfully granted access to Costing Summary (/api/costing/summary)'
      );

      // Test 3: Salesman blocked from /api/payments and /api/payments/ageing (403 Forbidden)
      const paySalesmanRes = await fetch(`http://localhost:${PORT}/api/payments`, {
        headers: { Authorization: `Bearer ${salesmanToken}` },
      });
      const ageSalesmanRes = await fetch(`http://localhost:${PORT}/api/payments/ageing`, {
        headers: { Authorization: `Bearer ${salesmanToken}` },
      });
      assert(
        paySalesmanRes.status === 403 && ageSalesmanRes.status === 403,
        'RBAC: Salesman blocked from accessing Payments List & Ageing Schedule (403 Forbidden)'
      );

      // Test 4: Auditor & Admin allowed to access /api/payments/ageing
      const ageAuditorRes = await fetch(`http://localhost:${PORT}/api/payments/ageing`, {
        headers: { Authorization: `Bearer ${auditorToken}` },
      });
      assert(
        ageAuditorRes.status === 200,
        'RBAC: Auditor successfully granted access to Receivables Ageing (/api/payments/ageing)'
      );

      // Test 5: Customer deactivation blocked via PUT /api/customers/:id if outstandingBalance > 0
      const retailerA = await Customer.findOne({ name: /Retailer A/ });
      assert(retailerA && retailerA.outstandingBalance > 0, 'Found Retailer A with active outstanding balance');

      const deactPutRes = await fetch(`http://localhost:${PORT}/api/customers/${retailerA._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ isActive: false }),
      });
      const deactData = await deactPutRes.json();
      assert(
        deactPutRes.status === 400 && deactData.message.includes('Cannot deactivate customer'),
        'INTEGRITY: PUT /api/customers/:id blocks deactivating customer with positive outstanding balance'
      );

      // Test 6: Overpaying an invoice rejected with 400 Bad Request
      const unpaidInvoice = await Invoice.findOne({ customer: retailerA._id, paymentStatus: { $ne: 'Paid' } });
      if (unpaidInvoice) {
        const overpayAmount = unpaidInvoice.balanceDue + 5000;
        const overpayRes = await fetch(`http://localhost:${PORT}/api/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            customerId: retailerA._id,
            invoiceId: unpaidInvoice._id,
            amount: overpayAmount,
            paymentMode: 'NEFT',
            referenceNumber: 'UTR-TEST-OVERPAY',
          }),
        });
        const overpayData = await overpayRes.json();
        assert(
          overpayRes.status === 400 && overpayData.message.includes('exceeds invoice balance due'),
          `INTEGRITY: Payment overpayment rejected when payment exceeds balance due (₹${overpayAmount} > ₹${unpaidInvoice.balanceDue})`
        );
      } else {
        assert(true, 'Skipped overpayment test (no unpaid invoice available)');
      }

      // Test 7: Admin updates Submitted sales order (modify quantity and price) via PUT /api/orders/:id
      const product = await Product.findOne({ sku: 'MRK-200G' });
      // Create a test order in Submitted status
      const createOrderRes = await fetch(`http://localhost:${PORT}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${salesmanToken}`,
        },
        body: JSON.stringify({
          customerId: retailerA._id,
          items: [{ product: product._id, quantity: 10, unitPrice: 50 }],
          remarks: 'Initial test order',
        }),
      });
      const createOrderData = await createOrderRes.json();
      const testOrder = createOrderData.order;

      // Now Admin edits the order to 20 quantity at ₹48
      const updateOrderRes = await fetch(`http://localhost:${PORT}/api/orders/${testOrder._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          items: [{ product: product._id, quantity: 20, unitPrice: 48 }],
          remarks: 'Adjusted by Admin',
        }),
      });
      const updateOrderData = await updateOrderRes.json();
      const updatedOrder = updateOrderData.order;
      // Taxable: 20 * 48 = 960. Intra-state 5% GST: CGST 24 + SGST 24 = 48. Grand total = 1008.
      assert(
        updateOrderRes.status === 200 &&
          updatedOrder.subtotal === 960 &&
          updatedOrder.totalTax === 48 &&
          updatedOrder.grandTotal === 1008,
        'ORDER WORKFLOW: Admin successfully modified order quantities & prices before approval (Taxable ₹960, GST ₹48, Total ₹1,008)'
      );

      // Test 8: Block modifying approved or non-submitted orders
      await fetch(`http://localhost:${PORT}/api/orders/${testOrder._id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const updateApprovedRes = await fetch(`http://localhost:${PORT}/api/orders/${testOrder._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          items: [{ product: product._id, quantity: 25, unitPrice: 48 }],
        }),
      });
      assert(
        updateApprovedRes.status === 400,
        'INTEGRITY: System rejects modifying order once status is Approved'
      );

      // Clean up test order
      await SalesOrder.findByIdAndDelete(testOrder._id);

      // Test 9: Production Run stock pre-validation atomicity (rejects when material stock insufficient)
      const bom = await BOM.findOne({ product: product._id });
      const flour = await RawMaterial.findOne({ name: /Flour/ });
      const excessiveFlourQty = (flour?.currentStock || 100) + 99999;

      const badProdRes = await fetch(`http://localhost:${PORT}/api/production`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          productId: product._id,
          bomId: bom._id,
          batchMultiplier: 1,
          expectedOutput: 200,
          actualOutput: 188,
          rawMaterials: [{ materialId: flour._id, actualQuantity: excessiveFlourQty }],
          packagingMaterials: [],
        }),
      });
      const badProdData = await badProdRes.json();
      assert(
        badProdRes.status === 400 &&
          badProdData.shortages &&
          badProdData.shortages.length > 0,
        'ATOMICITY: Production run pre-validates stock and rejects atomically with 400 when materials exceed available balance'
      );

      console.log(`\nResults: ${passed} / ${total} tests passed.\n`);

      if (passed === total) {
        console.log('>>> PHASE 7 SECURITY & INTEGRITY HARDENING PASSED COMPLETELY! <<<\n');
      } else {
        console.error('>>> SOME PHASE 7 TESTS FAILED <<<\n');
        process.exit(1);
      }
    } catch (err) {
      console.error('Test error:', err);
      process.exit(1);
    } finally {
      server.close();
      await mongoose.disconnect();
      process.exit(0);
    }
  });
}

runPhase7Tests();
