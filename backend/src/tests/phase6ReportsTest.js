require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const { app } = require('../server');

const PORT = 5093;

async function runPhase6Tests() {
  console.log('\n======================================================');
  console.log('       PHASE 6 AUDIT & 15 REPORTS TEST SUITE          ');
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
      // Login Auditor (Read-only role)
      const auditLogin = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'auditor@nitfood.com', password: 'Password@123' }),
      });
      const auditorToken = (await auditLogin.json()).token;

      const reportsToTest = [
        { path: 'sales-register', name: '1. Sales Register' },
        { path: 'customer-sales', name: '2. Customer-wise Sales' },
        { path: 'product-sales', name: '3. Product-wise Sales' },
        { path: 'gst-summary', name: '4. GST Summary' },
        { path: 'purchase-register', name: '5. Purchase Register' },
        { path: 'raw-materials', name: '6. Raw Material Stock Report' },
        { path: 'packaging-materials', name: '7. Packaging Material Stock Report' },
        { path: 'finished-goods', name: '8. Finished Goods Stock Report' },
        { path: 'stock-ledger', name: '9. Stock Movement Ledger' },
        { path: 'production', name: '10. Production Report' },
        { path: 'consumption', name: '11. Planned vs Actual Consumption Report' },
        { path: 'wastage', name: '12. Wastage & Damage Report' },
        { path: 'cost-per-packet', name: '13. Cost Per Packet & Margin Report' },
        { path: 'collections', name: '14. Payment & Collection Report' },
        { path: 'outstanding-ageing', name: '15. Outstanding Receivables with Ageing Report' },
      ];

      for (const rep of reportsToTest) {
        const res = await fetch(`http://localhost:${PORT}/api/reports/${rep.path}`, {
          headers: { Authorization: `Bearer ${auditorToken}` },
        });
        const repData = await res.json();
        assert(
          res.status === 200 && repData.success && Array.isArray(repData.data),
          `Auditor accessed ${rep.name} (returns structured records)`
        );
      }

      console.log(`\nResults: ${passed} / ${total} tests passed.`);
      server.close(() => {
        mongoose.connection.close();
        if (passed === total) {
          console.log('\n>>> PHASE 6 TEST SUITE PASSED COMPLETELY! <<<\n');
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

runPhase6Tests();
