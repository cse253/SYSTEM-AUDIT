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
  .get(authorize('admin', 'owner', 'accountant_auditor'), getPayments)
  .post(authorize('admin', 'owner'), recordPayment);

router.get('/ageing', authorize('admin', 'owner', 'accountant_auditor'), getReceivablesAgeing);

module.exports = router;
