const express = require('express');
const router = express.Router();
const {
  getSalesRegister,
  getCustomerWiseSales,
  getProductWiseSales,
  getGSTSummary,
  getPurchaseRegister,
  getRawMaterialStock,
  getPackagingStock,
  getFinishedGoodsStock,
  getStockMovementLedger,
  getProductionReport,
  getConsumptionReport,
  getWastageReport,
  getCostPerPacketReport,
  getPaymentCollectionReport,
  getOutstandingAgeingReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'owner', 'accountant_auditor')); // Restricted to Auditor, Admin, and Owner

router.get('/sales-register', getSalesRegister);
router.get('/customer-sales', getCustomerWiseSales);
router.get('/product-sales', getProductWiseSales);
router.get('/gst-summary', getGSTSummary);
router.get('/purchase-register', getPurchaseRegister);
router.get('/raw-materials', getRawMaterialStock);
router.get('/packaging-materials', getPackagingStock);
router.get('/finished-goods', getFinishedGoodsStock);
router.get('/stock-ledger', getStockMovementLedger);
router.get('/production', getProductionReport);
router.get('/consumption', getConsumptionReport);
router.get('/wastage', getWastageReport);
router.get('/cost-per-packet', getCostPerPacketReport);
router.get('/collections', getPaymentCollectionReport);
router.get('/outstanding-ageing', getOutstandingAgeingReport);

module.exports = router;
