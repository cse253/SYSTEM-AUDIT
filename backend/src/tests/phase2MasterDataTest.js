require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const { app } = require('../server');

const PORT = 5097;

async function runPhase2Tests() {
  console.log('\n======================================================');
  console.log('       PHASE 2 MASTER DATA & DASHBOARDS TEST SUITE    ');
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
      // 1. Login as Admin
      const adminLogin = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@nitfood.com', password: 'Password@123' }),
      });
      const adminData = await adminLogin.json();
      const adminToken = adminData.token;

      // 2. Login as Salesman
      const salesmanLogin = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'salesman@nitfood.com', password: 'Password@123' }),
      });
      const salesmanData = await salesmanLogin.json();
      const salesmanToken = salesmanData.token;

      // 3. Test Products API
      const prodRes = await fetch(`http://localhost:${PORT}/api/products`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const prodData = await prodRes.json();
      const murukku = prodData.products.find((p) => p.sku === 'MRK-200G');
      assert(
        murukku && murukku.sellingPrice === 50 && murukku.gstPercentage === 5 && murukku.currentStock === 50,
        'Benchmark Product "Murukku 200 g" verified (₹50, 5% GST, 50 packets stock)'
      );

      // 4. Test Customers API
      const custRes = await fetch(`http://localhost:${PORT}/api/customers`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const custData = await custRes.json();
      const retailerA = custData.customers.find((c) => c.name === 'Retailer A');
      const distributorB = custData.customers.find((c) => c.name === 'Distributor B');
      assert(
        retailerA && retailerA.state === 'Tamil Nadu' && retailerA.stateCode === '33',
        'Customer "Retailer A" configured as Tamil Nadu (State Code: 33)'
      );
      assert(
        distributorB && distributorB.state === 'Karnataka' && distributorB.stateCode === '29',
        'Customer "Distributor B" configured as Karnataka (State Code: 29)'
      );

      // 5. Test Raw Materials API
      const rmRes = await fetch(`http://localhost:${PORT}/api/materials/raw`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const rmData = await rmRes.json();
      const flour = rmData.materials.find((m) => m.code === 'RM-FLOUR');
      const oil = rmData.materials.find((m) => m.code === 'RM-OIL');
      const spice = rmData.materials.find((m) => m.code === 'RM-SPICE');
      assert(
        flour && flour.currentStock === 100 && flour.valuationRate === 42,
        'Flour opening stock verified (100 kg @ ₹42/kg)'
      );
      assert(
        oil && oil.currentStock === 30 && oil.valuationRate === 140,
        'Cooking oil opening stock verified (30 litres @ ₹140/litre)'
      );
      assert(
        spice && spice.currentStock === 5 && spice.valuationRate === 200,
        'Salt and spice mix opening stock verified (5 kg @ ₹200/kg)'
      );

      // 6. Test Packaging Materials API
      const pkgRes = await fetch(`http://localhost:${PORT}/api/materials/packaging`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const pkgData = await pkgRes.json();
      const pouch = pkgData.materials.find((m) => m.code === 'PKG-POUCH-200G');
      const carton = pkgData.materials.find((m) => m.code === 'PKG-CARTON');
      assert(
        pouch && pouch.currentStock === 500 && pouch.valuationRate === 2.5,
        '200 g pouch opening stock verified (500 pieces @ ₹2.50)'
      );
      assert(
        carton && carton.currentStock === 30 && carton.valuationRate === 15,
        'Carton opening stock verified (30 pieces @ ₹15)'
      );

      // 7. Test RBAC: Salesman cannot create product (403 Forbidden)
      const unauthProdCreate = await fetch(`http://localhost:${PORT}/api/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${salesmanToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Unauthorized Sweet',
          sku: 'UNAUTH-01',
          sellingPrice: 100,
        }),
      });
      assert(
        unauthProdCreate.status === 403,
        'RBAC: Salesman blocked from creating products (403 Forbidden)'
      );

      // 8. Test Dashboard Summary API
      const dashRes = await fetch(`http://localhost:${PORT}/api/dashboard/summary`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const dashData = await dashRes.json();
      assert(
        dashData.success && dashData.summary && dashData.summary.totalFinishedGoodsStock >= 50,
        'Dashboard Summary endpoint aggregates inventory & stock balances'
      );

      console.log(`\nResults: ${passed} / ${total} tests passed.`);
      server.close(() => {
        mongoose.connection.close();
        if (passed === total) {
          console.log('\n>>> PHASE 2 TEST SUITE PASSED COMPLETELY! <<<\n');
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

runPhase2Tests();
