const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// --- INFLUENCER ROUTES ---

// Route for influencers to apply to a specific campaign
router.post('/apply', verifyToken, applicationController.applyToCampaign);

// (Optional) Route for influencers to see their own application history
 router.get('/my-applications', verifyToken, applicationController.getInfluencerApplications);


// --- BRAND ROUTES ---

// Route for brands to hire or reject an influencer
// We use PUT because we are updating an existing record (the status)
router.put('/update-status', verifyToken, applicationController.updateApplicationStatus);

module.exports = router;