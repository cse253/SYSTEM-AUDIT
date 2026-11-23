const express = require('express');
const router = express.Router();
const { getCostingSummary } = require('../controllers/costingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/summary', authorize('admin', 'owner', 'accountant_auditor'), getCostingSummary);

module.exports = router;
