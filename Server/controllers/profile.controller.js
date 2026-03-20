const InfluencerProfile = require('../models/influencerProfile');

exports.updateInfluencerProfile = async (req, res) => {
    try {
        const { bio, niche, followers_count, social_links } = req.body;
        const userId = req.user.id; // This comes from your Auth Middleware (JWT)

        let profile = await InfluencerProfile.findOne({ where: { user_id: userId } });

        if (profile) {
            // Update existing profile [cite: 215]
            await profile.update({ bio, niche, followers_count, social_links });
            return res.json({ message: "Profile updated successfully", profile });
        } else {
            // Create new profile [cite: 209]
            profile = await InfluencerProfile.create({
                user_id: userId,
                bio, niche, followers_count, social_links
            });
            return res.status(201).json({ message: "Profile created successfully", profile });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
