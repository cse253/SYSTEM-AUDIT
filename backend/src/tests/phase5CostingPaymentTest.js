require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const { app } = require('../server');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');

const PORT = 5094;

async function runPhase5Tests() {
  console.log('\n======================================================');
  console.log('       PHASE 5 COSTING & PAYMENT TEST SUITE           ');
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
      // 1. Login Admin
      const adminLogin = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@nitfood.com', password: 'Password@123' }),
      });
      const adminToken = (await adminLogin.json()).token;

      // 2. Fetch Retailer A and their invoice
      const retailerA = await Customer.findOne({ name: 'Retailer A' });
      const invoice = await Invoice.findOne({ customer: retailerA._id });

      assert(invoice && invoice.grandTotal === 7875, 'Found Retailer A GST Invoice of ₹7,875.00');

      // 3. Step 6: Record ₹4,000 payment from Retailer A
      const payRes = await fetch(`http://localhost:${PORT}/api/payments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: retailerA._id,
          invoiceId: invoice._id,
          amount: 4000,
          paymentMode: 'NEFT',
          referenceNumber: 'UTR-HDFC-BENCHMARK-6',
          remarks: 'Step 6 benchmark payment from Retailer A',
        }),
      });

      const payData = await payRes.json();
      assert(payRes.status === 201 && payData.success, 'Step 6: Successfully recorded ₹4,000 payment from Retailer A');

      // 4. Verify Retailer A Outstanding Balance: ₹7,875 - ₹4,000 = ₹3,875
      assert(
        payData.customerOutstanding === 3875,
        'Retailer A outstanding balance reconciled: ₹7,875 - ₹4,000 = ₹3,875'
      );

      // 5. Verify Invoice status & partial payment balances
      const updatedInv = await Invoice.findById(invoice._id);
      assert(
        updatedInv.amountPaid === 4000 &&
          updatedInv.balanceDue === 3875 &&
          updatedInv.paymentStatus === 'Partially Paid',
        'Invoice updated to "Partially Paid" with amountPaid ₹4,000 and balanceDue ₹3,875'
      );

      // 6. Test Receivables Ageing API
      const ageRes = await fetch(`http://localhost:${PORT}/api/payments/ageing`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const ageData = await ageRes.json();
      const retAge = ageData.customers.find((c) => c.customerName.includes('Retailer A'));
      assert(
        retAge && retAge.totalDue === 3875 && retAge.current0to30 === 3875,
        'Receivables Ageing schedule properly allocates ₹3,875 to 0-30 days current bucket'
      );

      // 7. Test Costing Summary API
      const costRes = await fetch(`http://localhost:${PORT}/api/costing/summary`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const costData = await costRes.json();
      assert(
        costData.success &&
          costData.summary.totalProductionCost > 0 &&
          costData.summary.averageCostPerPacket > 0,
        'Costing API returns detailed overheads, total production cost and average cost per packet'
      );

      console.log(`\nResults: ${passed} / ${total} tests passed.`);
      server.close(() => {
        mongoose.connection.close();
        if (passed === total) {
          console.log('\n>>> PHASE 5 TEST SUITE PASSED COMPLETELY! <<<\n');
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

runPhase5Tests();
