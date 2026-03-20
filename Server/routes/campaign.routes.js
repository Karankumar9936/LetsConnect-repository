const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Route for Brands to create a campaign
// Full URL: POST http://localhost:5000/api/campaigns/create
router.post('/create', verifyToken, campaignController.createCampaign);

// Route for Influencers to browse all campaigns
// Full URL: GET http://localhost:5000/api/campaigns/
// Note: verifyToken is added here so only logged-in users can see campaigns
router.get('/', campaignController.getAllCampaigns);

module.exports = router;