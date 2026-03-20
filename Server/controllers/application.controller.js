 
const Application = require('../models/Application');
const Campaign = require('../models/Campaign'); // Added this to support the Join logic

exports.applyToCampaign = async (req, res) => {
    try {
        const { campaign_id, message } = req.body;
        const influencer_id = req.user.id;

        // 1. Check if the user is an influencer
        if (req.user.role !== 'influencer') {
            return res.status(403).json({ message: "Only influencers can apply for campaigns." });
        }

        // 2. Check for existing application
        const existingApp = await Application.findOne({ 
            where: { campaign_id, influencer_id } 
        });

        if (existingApp) {
            return res.status(400).json({ message: "You have already applied for this campaign." });
        }

        // 3. Create application
        const application = await Application.create({
            campaign_id,
            influencer_id,
            message
        });

        res.status(201).json({ message: "Application submitted!", application });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { application_id, status } = req.body;

        // 1. Basic validation of the status input
        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Use 'accepted' or 'rejected'." });
        }

        // 2. Find the application
        const application = await Application.findByPk(application_id);

        if (!application) {
            return res.status(404).json({ message: "Application not found." });
        }

        // 3. Update the status
        application.status = status;
        await application.save();

        res.status(200).json({ 
            message: `Application has been ${status} successfully!`,
            application 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- NEW LOGIC ADDED BELOW ---

exports.getInfluencerApplications = async (req, res) => {
    try {
        const influencer_id = req.user.id;

        const myApplications = await Application.findAll({
            where: { influencer_id },
            include: [
                {
                    model: Campaign,
                    attributes: ['title', 'platform', 'budget'] 
                }
            ]
        });

        res.status(200).json(myApplications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};