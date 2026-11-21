require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const RawMaterial = require('../models/RawMaterial');
const PackagingMaterial = require('../models/PackagingMaterial');
const StockLedger = require('../models/StockLedger');

const seedMasterData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nit_food_erp';
    await mongoose.connect(mongoUri);
    console.log(`[Seed Master Data] Connected to MongoDB at ${mongoUri}`);

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      throw new Error('Admin user not found. Run seed:users first.');
    }

    // 1. Seed Benchmark Finished Product: Murukku 200 g
    let murukku = await Product.findOne({ sku: 'MRK-200G' });
    if (!murukku) {
      murukku = await Product.create({
        name: 'Murukku 200 g',
        sku: 'MRK-200G',
        category: 'Murukku',
        packSize: 200,
        packUnit: 'g',
        sellingPrice: 50.00,
        gstPercentage: 5,
        hsnCode: '21069099',
        unit: 'packets',
        currentStock: 50,
        minStockLevel: 50,
        description: 'Crispy South Indian traditional rice & urad dal savoury snack',
      });
      console.log('[Seed Master] Created Product: Murukku 200 g (Initial Stock: 50 packets @ ₹50)');

      // Record Opening Stock in Ledger
      await StockLedger.create({
        itemType: 'Product',
        item: murukku._id,
        itemName: murukku.name,
        itemCategory: 'finished_goods',
        movementType: 'OPENING_BALANCE',
        direction: 1,
        quantity: 50,
        unit: 'packets',
        unitRate: 50,
        totalValue: 2500,
        balanceBefore: 0,
        balanceAfter: 50,
        sourceDocumentType: 'InitialSetup',
        remarks: 'Benchmark initial finished goods opening balance',
        user: admin._id,
      });
    } else {
      console.log('[Seed Master] Product Murukku 200 g already exists.');
    }

    // Additional typical packaged food products for richness
    const additionalProducts = [
      { name: 'Special Mixture 250 g', sku: 'MIX-250G', category: 'Mixture', packSize: 250, sellingPrice: 65, gstPercentage: 5, hsnCode: '21069099', unit: 'packets', currentStock: 40, minStockLevel: 25 },
      { name: 'Banana Chips (Coconut Oil) 200 g', sku: 'CHP-BAN-200G', category: 'Chips', packSize: 200, sellingPrice: 70, gstPercentage: 5, hsnCode: '20081940', unit: 'packets', currentStock: 35, minStockLevel: 20 },
      { name: 'Traditional Mysore Pak 250 g', sku: 'SWT-MYSPK-250G', category: 'Sweets', packSize: 250, sellingPrice: 120, gstPercentage: 5, hsnCode: '21069099', unit: 'packets', currentStock: 25, minStockLevel: 15 },
    ];

    for (const p of additionalProducts) {
      const exists = await Product.findOne({ sku: p.sku });
      if (!exists) {
        await Product.create(p);
      }
    }

    // 2. Seed Benchmark Raw Materials
    // Flour: 100 kg @ ₹42/kg
    let flour = await RawMaterial.findOne({ code: 'RM-FLOUR' });
    if (!flour) {
      flour = await RawMaterial.create({
        name: 'Flour',
        code: 'RM-FLOUR',
        category: 'Flours & Grains',
        unit: 'kg',
        currentStock: 100,
        reorderLevel: 30,
        valuationRate: 42.00,
        totalValue: 4200.00,
        hsnCode: '11010000',
      });
      console.log('[Seed Master] Created Raw Material: Flour (100 kg @ ₹42/kg)');

      await StockLedger.create({
        itemType: 'RawMaterial',
        item: flour._id,
        itemName: flour.name,
        itemCategory: 'raw_material',
        movementType: 'OPENING_BALANCE',
        direction: 1,
        quantity: 100,
        unit: 'kg',
        unitRate: 42,
        totalValue: 4200,
        balanceBefore: 0,
        balanceAfter: 100,
        sourceDocumentType: 'InitialSetup',
        remarks: 'Benchmark opening stock of Flour',
        user: admin._id,
      });
    }

    // Cooking oil: 30 litres @ ₹140/litre
    let oil = await RawMaterial.findOne({ code: 'RM-OIL' });
    if (!oil) {
      oil = await RawMaterial.create({
        name: 'Cooking oil',
        code: 'RM-OIL',
        category: 'Edible Oils',
        unit: 'litres',
        currentStock: 30,
        reorderLevel: 15,
        valuationRate: 140.00,
        totalValue: 4200.00,
        hsnCode: '15159099',
      });
      console.log('[Seed Master] Created Raw Material: Cooking oil (30 litres @ ₹140/litre)');

      await StockLedger.create({
        itemType: 'RawMaterial',
        item: oil._id,
        itemName: oil.name,
        itemCategory: 'raw_material',
        movementType: 'OPENING_BALANCE',
        direction: 1,
        quantity: 30,
        unit: 'litres',
        unitRate: 140,
        totalValue: 4200,
        balanceBefore: 0,
        balanceAfter: 30,
        sourceDocumentType: 'InitialSetup',
        remarks: 'Benchmark opening stock of Cooking oil',
        user: admin._id,
      });
    }

    // Salt and spice mix: 5 kg @ ₹200/kg
    let spice = await RawMaterial.findOne({ code: 'RM-SPICE' });
    if (!spice) {
      spice = await RawMaterial.create({
        name: 'Salt and spice mix',
        code: 'RM-SPICE',
        category: 'Spices & Seasoning',
        unit: 'kg',
        currentStock: 5,
        reorderLevel: 2,
        valuationRate: 200.00,
        totalValue: 1000.00,
        hsnCode: '21039090',
      });
      console.log('[Seed Master] Created Raw Material: Salt and spice mix (5 kg @ ₹200/kg)');

      await StockLedger.create({
        itemType: 'RawMaterial',
        item: spice._id,
        itemName: spice.name,
        itemCategory: 'raw_material',
        movementType: 'OPENING_BALANCE',
        direction: 1,
        quantity: 5,
        unit: 'kg',
        unitRate: 200,
        totalValue: 1000,
        balanceBefore: 0,
        balanceAfter: 5,
        sourceDocumentType: 'InitialSetup',
        remarks: 'Benchmark opening stock of Salt and spice mix',
        user: admin._id,
      });
    }

    // 3. Seed Benchmark Packaging Materials
    // 200 g pouch: 500 pieces @ ₹2.50/piece
    let pouch = await PackagingMaterial.findOne({ code: 'PKG-POUCH-200G' });
    if (!pouch) {
      pouch = await PackagingMaterial.create({
        name: '200 g pouch',
        code: 'PKG-POUCH-200G',
        unit: 'pieces',
        currentStock: 500,
        reorderLevel: 200,
        valuationRate: 2.50,
        totalValue: 1250.00,
        hsnCode: '39232100',
      });
      console.log('[Seed Master] Created Packaging Material: 200 g pouch (500 pieces @ ₹2.50)');

      await StockLedger.create({
        itemType: 'PackagingMaterial',
        item: pouch._id,
        itemName: pouch.name,
        itemCategory: 'packaging_material',
        movementType: 'OPENING_BALANCE',
        direction: 1,
        quantity: 500,
        unit: 'pieces',
        unitRate: 2.5,
        totalValue: 1250,
        balanceBefore: 0,
        balanceAfter: 500,
        sourceDocumentType: 'InitialSetup',
        remarks: 'Benchmark opening stock of 200 g pouch',
        user: admin._id,
      });
    }

    // Carton: 30 pieces @ ₹15/piece
    let carton = await PackagingMaterial.findOne({ code: 'PKG-CARTON' });
    if (!carton) {
      carton = await PackagingMaterial.create({
        name: 'Carton',
        code: 'PKG-CARTON',
        unit: 'pieces',
        currentStock: 30,
        reorderLevel: 10,
        valuationRate: 15.00,
        totalValue: 450.00,
        hsnCode: '48191010',
      });
      console.log('[Seed Master] Created Packaging Material: Carton (30 pieces @ ₹15)');

      await StockLedger.create({
        itemType: 'PackagingMaterial',
        item: carton._id,
        itemName: carton.name,
        itemCategory: 'packaging_material',
        movementType: 'OPENING_BALANCE',
        direction: 1,
        quantity: 30,
        unit: 'pieces',
        unitRate: 15,
        totalValue: 450,
        balanceBefore: 0,
        balanceAfter: 30,
        sourceDocumentType: 'InitialSetup',
        remarks: 'Benchmark opening stock of Carton',
        user: admin._id,
      });
    }

    // 4. Seed Benchmark Customers
    // Retailer A (Tamil Nadu, State Code: 33)
    let retailerA = await Customer.findOne({ name: 'Retailer A' });
    if (!retailerA) {
      retailerA = await Customer.create({
        name: 'Retailer A',
        customerType: 'Retailer',
        gstin: '33AAAAA1234A1Z5',
        phone: '9842100111',
        email: 'retailera@gmail.com',
        address: 'No. 12, Big Bazaar Street, Singarathope',
        city: 'Tiruchirappalli',
        state: 'Tamil Nadu',
        stateCode: '33',
        creditLimit: 50000,
        outstandingBalance: 0,
      });
      console.log('[Seed Master] Created Customer: Retailer A (Tamil Nadu - State Code 33)');
    }

    // Distributor B (Karnataka, State Code: 29)
    let distributorB = await Customer.findOne({ name: 'Distributor B' });
    if (!distributorB) {
      distributorB = await Customer.create({
        name: 'Distributor B',
        customerType: 'Distributor',
        gstin: '29BBBBB5678B1Z2',
        phone: '9842100222',
        email: 'distributorb@gmail.com',
        address: 'Plot 45, APMC Yard, Yeshwanthpur',
        city: 'Bengaluru',
        state: 'Karnataka',
        stateCode: '29',
        creditLimit: 100000,
        outstandingBalance: 0,
      });
      console.log('[Seed Master] Created Customer: Distributor B (Karnataka - State Code 29)');
    }

    // 5. Seed Suppliers
    let supplierAgro = await Supplier.findOne({ name: 'Annapoorna Agro Flour Mills' });
    if (!supplierAgro) {
      supplierAgro = await Supplier.create({
        name: 'Annapoorna Agro Flour Mills',
        contactPerson: 'S. Ramanathan',
        gstin: '33AAACF1111A1Z1',
        phone: '9842188801',
        email: 'annapoorna.agro@gmail.com',
        address: 'Phase II, SIDCO Industrial Estate, Thuvakudi',
        state: 'Tamil Nadu',
        stateCode: '33',
        suppliedMaterialTypes: ['RawMaterial'],
      });
      console.log('[Seed Master] Created Supplier: Annapoorna Agro Flour Mills');
    }

    let supplierPkg = await Supplier.findOne({ name: 'Supreme Packaging Industries' });
    if (!supplierPkg) {
      supplierPkg = await Supplier.create({
        name: 'Supreme Packaging Industries',
        contactPerson: 'K. Balaji',
        gstin: '33AAACS2222A1Z2',
        phone: '9842188802',
        email: 'supreme.packaging@gmail.com',
        address: 'Industrial Corridor, Ariyamangalam',
        state: 'Tamil Nadu',
        stateCode: '33',
        suppliedMaterialTypes: ['PackagingMaterial'],
      });
      console.log('[Seed Master] Created Supplier: Supreme Packaging Industries');
    }

    console.log('[Seed Master Data] Successfully completed master data seeding!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Master Error]', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedMasterData();
}

module.exports = seedMasterData;
