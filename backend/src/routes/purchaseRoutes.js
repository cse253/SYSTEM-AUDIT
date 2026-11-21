const express = require('express');
const router = express.Router();
const {
  createPurchase,
  getPurchases,
} = require('../controllers/purchaseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getPurchases)
  .post(authorize('admin', 'owner', 'production_supervisor'), createPurchase);

module.exports = router;
