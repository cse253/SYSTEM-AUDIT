const express = require('express');
const router = express.Router();
const {
  createProductionRun,
  getProductionRuns,
  getProductionRunById,
} = require('../controllers/productionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getProductionRuns)
  .post(authorize('admin', 'owner', 'production_supervisor'), createProductionRun);

router.get('/:id', getProductionRunById);

module.exports = router;
