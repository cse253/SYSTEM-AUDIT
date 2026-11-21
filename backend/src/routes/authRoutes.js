const express = require('express');
const router = express.Router();
const { login, getMe, register, getAllUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/register', protect, authorize('admin', 'owner'), register);
router.get('/users', protect, authorize('admin', 'owner'), getAllUsers);

module.exports = router;
