const BrandProfile = require('../models/BrandProfile');

exports.updateBrandProfile = async (req, res) => {
    try {
        const { company_name, website, target_audience } = req.body;
        const userId = req.user.id; // From verifyToken middleware

        let profile = await BrandProfile.findOne({ where: { user_id: userId } });

        if (profile) {
            await profile.update({ company_name, website, target_audience });
            return res.json({ message: "Brand profile updated", profile });
        } else {
            profile = await BrandProfile.create({
                user_id: userId,
                company_name, website, target_audience
            });
            return res.status(201).json({ message: "Brand profile created", profile });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};