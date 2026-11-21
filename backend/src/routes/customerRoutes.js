const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getCustomers)
  .post(authorize('salesman', 'admin', 'owner'), createCustomer);

router.route('/:id')
  .get(getCustomerById)
  .put(authorize('salesman', 'admin', 'owner'), updateCustomer)
  .delete(authorize('admin', 'owner'), deleteCustomer);

module.exports = router;
