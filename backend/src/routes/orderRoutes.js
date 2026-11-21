const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  approveOrder,
  rejectOrder,
  dispatchOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getOrders)
  .post(authorize('salesman', 'admin', 'owner'), createOrder);

router.route('/:id')
  .get(getOrderById);

router.put('/:id/approve', authorize('admin', 'owner'), approveOrder);
router.put('/:id/reject', authorize('admin', 'owner'), rejectOrder);
router.post('/:id/dispatch', authorize('admin', 'owner'), dispatchOrder);

module.exports = router;
