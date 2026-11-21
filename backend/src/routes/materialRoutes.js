const express = require('express');
const router = express.Router();
const {
  getRawMaterials,
  createRawMaterial,
  updateRawMaterial,
  getPackagingMaterials,
  createPackagingMaterial,
  updatePackagingMaterial,
} = require('../controllers/materialController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Raw materials
router.route('/raw')
  .get(getRawMaterials)
  .post(authorize('admin', 'owner', 'production_supervisor'), createRawMaterial);

router.route('/raw/:id')
  .put(authorize('admin', 'owner', 'production_supervisor'), updateRawMaterial);

// Packaging materials
router.route('/packaging')
  .get(getPackagingMaterials)
  .post(authorize('admin', 'owner', 'production_supervisor'), createPackagingMaterial);

router.route('/packaging/:id')
  .put(authorize('admin', 'owner', 'production_supervisor'), updatePackagingMaterial);

module.exports = router;
