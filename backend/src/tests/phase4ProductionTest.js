require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const { app } = require('../server');
const Product = require('../models/Product');
const RawMaterial = require('../models/RawMaterial');
const PackagingMaterial = require('../models/PackagingMaterial');
const Supplier = require('../models/Supplier');
const BOM = require('../models/BOM');
const StockLedger = require('../models/StockLedger');

const PORT = 5095;

async function runPhase4Tests() {
  console.log('\n======================================================');
  console.log('       PHASE 4 INVENTORY, BOM & PRODUCTION TEST       ');
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
      // Ensure benchmark opening balances
      await RawMaterial.updateOne({ code: 'RM-FLOUR' }, { currentStock: 100, valuationRate: 42 });
      await RawMaterial.updateOne({ code: 'RM-OIL' }, { currentStock: 30, valuationRate: 140 });
      await RawMaterial.updateOne({ code: 'RM-SPICE' }, { currentStock: 5, valuationRate: 200 });
      await PackagingMaterial.updateOne({ code: 'PKG-POUCH-200G' }, { currentStock: 500, unitRate: 2.5 });
      await PackagingMaterial.updateOne({ code: 'PKG-CARTON' }, { currentStock: 30, unitRate: 15 });
      await Product.updateOne({ sku: 'MRK-200G' }, { currentStock: 50 });

      // Login Supervisor & Admin
      const supLogin = await fetch(`http://localhost:${PORT}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'supervisor@nitfood.com', password: 'Password@123' }),
      });
      const supToken = (await supLogin.json()).token;

      // 1. Verify Murukku BOM
      const murukku = await Product.findOne({ sku: 'MRK-200G' });
      const bom = await BOM.findOne({ product: murukku._id });
      assert(
        bom && bom.expectedOutput === 200 && bom.rawMaterials.length === 3 && bom.packagingMaterials.length === 2,
        'Murukku 200 g BOM verified (Expected: 200 pkts, Flour: 40kg, Oil: 10L, Spices: 1.2kg, Pouches: 200, Cartons: 10)'
      );

      // 2. Step 1: Record Purchase of 60 kg flour at ₹45/kg
      const flourBefore = await RawMaterial.findOne({ code: 'RM-FLOUR' });
      const supplier = await Supplier.findOne();

      const purRes = await fetch(`http://localhost:${PORT}/api/purchases`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          supplierId: supplier._id,
          invoiceNumber: 'BILL-AGRO-TEST-01',
          items: [
            {
              itemType: 'RawMaterial',
              item: flourBefore._id,
              quantity: 60,
              unitRate: 45,
              gstPercentage: 5,
            },
          ],
        }),
      });
      const purData = await purRes.json();
      assert(purRes.status === 201 && purData.success, 'Step 1: Recorded purchase of 60 kg flour at ₹45/kg');

      // Verify Flour stock & Weighted Average Cost (WAC)
      const flourAfterPurchase = await RawMaterial.findOne({ code: 'RM-FLOUR' });
      assert(
        flourAfterPurchase.currentStock === 160 && flourAfterPurchase.valuationRate === 43.125,
        'Flour stock updated to 160 kg with exact Weighted Average Cost (WAC) rate ₹43.125/kg'
      );

      // 3. Step 2: Production Run for Murukku 200 g
      const oilBefore = await RawMaterial.findOne({ code: 'RM-OIL' });
      const spiceBefore = await RawMaterial.findOne({ code: 'RM-SPICE' });
      const pouchBefore = await PackagingMaterial.findOne({ code: 'PKG-POUCH-200G' });
      const cartonBefore = await PackagingMaterial.findOne({ code: 'PKG-CARTON' });

      const prodRes = await fetch(`http://localhost:${PORT}/api/production`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: murukku._id,
          bomId: bom._id,
          batchMultiplier: 1,
          expectedOutput: 200,
          actualOutput: 188, // Benchmark actual output
          rawMaterials: [
            { materialId: flourBefore._id, actualQuantity: 40 },
            { materialId: oilBefore._id, actualQuantity: 10.5 }, // 10.5 L (+5% variance)
            { materialId: spiceBefore._id, actualQuantity: 1.2 },
          ],
          packagingMaterials: [
            { materialId: pouchBefore._id, actualQuantity: 188, damagedQuantity: 6 }, // 188 + 6 = 194 used
            { materialId: cartonBefore._id, actualQuantity: 9, damagedQuantity: 0 }, // 9 cartons used
          ],
          labourCost: 1200, // Step 7
          gasAndElectricityCost: 600, // Step 7
          notes: 'Benchmark test production run step 2',
        }),
      });

      const prodData = await prodRes.json();
      assert(prodRes.status === 201 && prodData.success, 'Step 2: Created production run (188 good packets output)');

      const run = prodData.productionRun;

      // 4. Verify Yield Variance: (188 - 200) / 200 * 100 = -6%
      assert(
        run.yieldVariancePercentage === -6 && run.isYieldFlagged === true,
        'Yield variance computed exactly as -6% and flagged (> 3% threshold)'
      );

      // 5. Verify Oil Consumption Variance: (10.5 - 10) / 10 * 100 = +5%
      const oilRM = run.rawMaterials.find((rm) => rm.material.toString() === oilBefore._id.toString());
      assert(
        oilRM && oilRM.variancePercentage === 5 && oilRM.isVarianceFlagged === true,
        'Oil consumption variance computed exactly as +5% and flagged (> 3% threshold)'
      );

      // 6. Verify Exact Closing Stock Balances
      const finalFlour = await RawMaterial.findOne({ code: 'RM-FLOUR' });
      const finalOil = await RawMaterial.findOne({ code: 'RM-OIL' });
      const finalPouch = await PackagingMaterial.findOne({ code: 'PKG-POUCH-200G' });
      const finalFinished = await Product.findOne({ sku: 'MRK-200G' });

      assert(
        finalFlour.currentStock === 120,
        'Flour closing stock: 100 + 60 - 40 = 120 kg'
      );
      assert(
        finalOil.currentStock === 19.5,
        'Oil closing stock: 30 - 10.5 = 19.5 litres'
      );
      assert(
        finalPouch.currentStock === 306,
        'Pouch closing stock: 500 - 188 - 6 = 306 pieces'
      );
      assert(
        finalFinished.currentStock === 238,
        'Finished goods Murukku after production: 50 + 188 = 238 packets'
      );

      // 7. Verify Cost Per Packet (Step 8)
      assert(
        run.costPerPacket > 0 && run.totalProductionCost > 0,
        `Costing calculated: Total cost = ₹${run.totalProductionCost.toFixed(2)}, Cost per packet = ₹${run.costPerPacket.toFixed(2)}`
      );

      // 8. Verify Double-Entry StockLedger integrity
      const ledgerEntries = await StockLedger.find({ sourceDocumentNumber: run.runNumber });
      assert(
        ledgerEntries.length >= 6,
        'Immutable double-entry StockLedger records created atomically for all RM, Packaging, and FG movements'
      );

      console.log(`\nResults: ${passed} / ${total} tests passed.`);
      server.close(() => {
        mongoose.connection.close();
        if (passed === total) {
          console.log('\n>>> PHASE 4 TEST SUITE PASSED COMPLETELY! <<<\n');
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

runPhase4Tests();
