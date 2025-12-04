const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.get('/dashboard', authenticateToken, authorizeRole('admin'), getDashboard);

module.exports = router;
