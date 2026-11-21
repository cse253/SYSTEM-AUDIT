const express = require('express');
const router = express.Router();
const {
  getStockLedger,
  getStockSummary,
  adjustStock,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/ledger', getStockLedger);
router.get('/summary', getStockSummary);
router.post('/adjustment', authorize('admin', 'owner'), adjustStock);

module.exports = router;
