const express = require('express');
const router = express.Router();
const { getCostingSummary } = require('../controllers/costingController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getCostingSummary);

module.exports = router;
