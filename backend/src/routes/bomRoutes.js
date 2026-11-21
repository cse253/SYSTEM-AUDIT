const express = require('express');
const router = express.Router();
const {
  getBOMs,
  getBOMByProductId,
  createBOM,
  updateBOM,
} = require('../controllers/bomController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getBOMs)
  .post(authorize('admin', 'owner', 'production_supervisor'), createBOM);

router.get('/product/:productId', getBOMByProductId);
router.put('/:id', authorize('admin', 'owner', 'production_supervisor'), updateBOM);

module.exports = router;
