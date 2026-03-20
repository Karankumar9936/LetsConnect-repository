const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');
// const influencerController = require('../controllers/influencer.controller.js'); 
const { authenticateToken } = require('../middleware/auth.middleware.js'); 

router.post('/register', authController.register);
router.post('/login', authController.login);
// // Ensure this matches the URL in your app.js fetch call
// router.post('/profile-update', authenticateToken, influencerController.updateProfile);

module.exports = router;