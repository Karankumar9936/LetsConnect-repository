const express = require('express');
const router = express.Router();
const InfluencerProfile = require('../models/influencerProfile');// error causing point
const profileController = require('../controllers/profile.controller');
const brandController = require('../controllers/brand.controller');
const { verifyToken } = require('../middleware/auth.middleware'); // Security check [cite: 656]

// Protected route: User must be logged in to update their profile
// Influencer Route
router.post('/influencer/update', verifyToken, profileController.updateInfluencerProfile);

// Brand route
router.post('/brand/update',verifyToken,brandController.updateBrandProfile);

router.get('/influencer/me', verifyToken, async (req, res) => {
    try {
        const profile = await InfluencerProfile.findOne({ where: { user_id: req.user.id } });
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;