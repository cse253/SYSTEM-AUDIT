const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All product routes require authentication

router.route('/')
  .get(getProducts)
  .post(authorize('admin', 'owner'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(authorize('admin', 'owner'), updateProduct)
  .delete(authorize('admin', 'owner'), deleteProduct);

module.exports = router;
