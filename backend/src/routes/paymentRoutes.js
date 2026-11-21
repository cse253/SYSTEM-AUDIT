const express = require('express');
const router = express.Router();
const {
  recordPayment,
  getPayments,
  getReceivablesAgeing,
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getPayments)
  .post(authorize('admin', 'owner'), recordPayment);

router.get('/ageing', getReceivablesAgeing);

module.exports = router;
