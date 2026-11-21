const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require('../controllers/supplierController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getSuppliers)
  .post(authorize('admin', 'owner', 'production_supervisor'), createSupplier);

router.route('/:id')
  .get(getSupplierById)
  .put(authorize('admin', 'owner'), updateSupplier)
  .delete(authorize('admin', 'owner'), deleteSupplier);

module.exports = router;
