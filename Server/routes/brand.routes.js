const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/brandDashboard.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Protect this route so only the logged-in brand can see their dashboard
router.get('/dashboard', verifyToken, dashboardController.getBrandDashboard);

module.exports = router;