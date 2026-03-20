const Campaign = require('../models/Campaign');
const BrandProfile = require('../models/BrandProfile');

exports.createCampaign = async (req, res) => {
    try {
        const { title, description, budget, platform, requirements } = req.body;
        
        // 1. Find the BrandProfile belonging to the logged-in User
        const brand = await BrandProfile.findOne({ where: { user_id: req.user.id } });

        if (!brand) {
            return res.status(403).json({ message: "Only registered brands can post campaigns." });
        }

        // 2. Create the campaign linked to that brand
        const campaign = await Campaign.create({
            brand_id: brand.brand_id,
            title,
            description,
            budget,
            platform,
            requirements
        });

        res.status(201).json({ message: "Campaign created successfully!", campaign });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Logic to let everyone (Influencers) see all open campaigns
exports.getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.findAll({ where: { status: 'open' } });
        res.json(campaigns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};