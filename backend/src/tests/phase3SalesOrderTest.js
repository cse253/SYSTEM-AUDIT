require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const { app } = require('../server');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

const PORT = 5096;

async function runPhase3Tests() {
  console.log('\n======================================================');
  console.log('       PHASE 3 SALES ORDER & GST INVOICE TEST SUITE   ');
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
      // 1. Log in Salesman & Admin
      const salesLogin = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'salesman@nitfood.com', password: 'Password@123' }),
      });
      const salesToken = (await salesLogin.json()).token;

      const adminLogin = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@nitfood.com', password: 'Password@123' }),
      });
      const adminToken = (await adminLogin.json()).token;

      // 2. Fetch master data IDs
      await Product.updateOne({ sku: 'MRK-200G' }, { currentStock: 50 });
      const murukku = await Product.findOne({ sku: 'MRK-200G' });
      const retailerA = await Customer.findOne({ name: 'Retailer A' });
      const distributorB = await Customer.findOne({ name: 'Distributor B' });
      const initialRetailerBalance = retailerA.outstandingBalance || 0;

      // 3. Test Intra-State Order (Retailer A in Tamil Nadu): 150 pkts @ ₹50
      const order1Res = await fetch(`http://localhost:${PORT}/api/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${salesToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: retailerA._id,
          items: [{ product: murukku._id, quantity: 150 }],
        }),
      });
      const order1Data = await order1Res.json();
      assert(order1Res.status === 201 && order1Data.success, 'Salesman submits order for Retailer A (Tamil Nadu)');

      const o1 = order1Data.order;
      assert(
        o1.subtotal === 7500 &&
          !o1.isInterState &&
          o1.items[0].cgstAmount === 187.5 &&
          o1.items[0].sgstAmount === 187.5 &&
          o1.grandTotal === 7875,
        'TN Intra-state GST exact calculation: Taxable ₹7,500 + CGST ₹187.50 + SGST ₹187.50 = ₹7,875'
      );

      // 4. Test Inter-State Order (Distributor B in Karnataka): 120 pkts @ ₹50
      const order2Res = await fetch(`http://localhost:${PORT}/api/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${salesToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: distributorB._id,
          items: [{ product: murukku._id, quantity: 120 }],
        }),
      });
      const order2Data = await order2Res.json();
      const o2 = order2Data.order;
      assert(
        o2.subtotal === 6000 &&
          o2.isInterState &&
          o2.items[0].igstAmount === 300 &&
          o2.grandTotal === 6300,
        'Karnataka Inter-state GST exact calculation: Taxable ₹6,000 + IGST 5% (₹300) = ₹6,300'
      );

      // 5. Test Admin approves Order 1
      const appRes = await fetch(`http://localhost:${PORT}/api/orders/${o1._id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const appData = await appRes.json();
      assert(appData.success && appData.order.status === 'Approved', 'Admin approves sales order for Retailer A');

      // 6. Test Admin generates GST Invoice for Order 1
      const invRes = await fetch(`http://localhost:${PORT}/api/invoices/generate/${o1._id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const invData = await invRes.json();
      assert(
        invRes.status === 201 &&
          invData.invoice &&
          invData.invoice.grandTotal === 7875 &&
          invData.invoice.balanceDue === 7875,
        'GST Tax Invoice generated with exact total ₹7,875.00 and balance due ₹7,875.00'
      );

      // 7. Verify Customer Outstanding Balance updated
      const updatedRetailerA = await Customer.findById(retailerA._id);
      assert(
        updatedRetailerA.outstandingBalance === initialRetailerBalance + 7875,
        `Customer Retailer A outstanding balance accurately incremented by ₹7,875.00 (from ₹${initialRetailerBalance} to ₹${updatedRetailerA.outstandingBalance})`
      );

      // 8. Test Stock Check: Order 2 (120 pkts) when Murukku stock is only 50 packets
      const dispatchAttempt = await fetch(`http://localhost:${PORT}/api/orders/${o2._id}/dispatch`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const dispatchAttemptData = await dispatchAttempt.json();
      assert(
        dispatchAttempt.status === 400 &&
          !dispatchAttemptData.success &&
          dispatchAttemptData.shortages &&
          dispatchAttemptData.shortages.length > 0,
        'CRITICAL: Prevents dispatch when stock is insufficient and reports exact shortage'
      );

      console.log(`\nResults: ${passed} / ${total} tests passed.`);
      server.close(() => {
        mongoose.connection.close();
        if (passed === total) {
          console.log('\n>>> PHASE 3 TEST SUITE PASSED COMPLETELY! <<<\n');
          process.exit(0);
        } else {
          process.exit(1);
        }
      });
    } catch (err) {
      console.error('Test execution error:', err);
      server.close(() => {
        mongoose.connection.close();
        process.exit(1);
      });
    }
  });
}

runPhase3Tests();
