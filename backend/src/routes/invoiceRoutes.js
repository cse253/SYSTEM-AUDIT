const express = require('express');
const router = express.Router();
const {
  generateInvoice,
  getInvoices,
  getInvoiceById,
  cancelInvoice,
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/generate/:orderId', authorize('admin', 'owner'), generateInvoice);
router.put('/:id/cancel', authorize('admin', 'owner'), cancelInvoice);

module.exports = router;
