// const Campaign = require('../models/Campaign');
// const Application = require('../models/Application');
// const User = require('../models/User');
// const BrandProfile = require('../models/BrandProfile');

// exports.getBrandDashboard = async (req, res) => {
//     try {
//         // 1. Identify the brand based on the logged-in user's ID
//         const brand = await BrandProfile.findOne({ where: { user_id: req.user.id } });

//         if (!brand) {
//             return res.status(404).json({ message: "Brand profile not found." });
//         }

//         // 2. Fetch all campaigns for this brand, including their applications
//         const dashboardData = await Campaign.findAll({
//             where: { brand_id: brand.brand_id },
//             include: [
//                 {
//                     model: Application,
//                     include: [
//                         {
//                             model: User,
//                             attributes: ['name', 'email', 'user_id'] // Get influencer info (exclude password)
//                         }
//                     ]
//                 }
//             ]
//         });

//         res.status(200).json(dashboardData);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

//upgraded
const Campaign = require('../models/Campaign');
const BrandProfile = require('../models/BrandProfile');
const Application = require('../models/Application');
const User = require('../models/User');

exports.getBrandDashboard = async (req, res) => {
    try {
        // 1. Find the Brand ID linked to the logged-in User
        const brand = await BrandProfile.findOne({ where: { user_id: req.user.id } });

        if (!brand) {
            return res.status(404).json({ message: "Brand profile not found" });
        }

        // 2. Fetch all campaigns for THIS brand
        // We "Include" Applications so you can see who applied to your ads
        const campaigns = await Campaign.findAll({
            where: { brand_id: brand.brand_id },
            include: [{
                model: Application,
                include: [{ model: User, attributes: ['name', 'email', 'user_id'] }]
            }]
        });

        res.json(campaigns);
    } catch (err) {
        console.error("Dashboard Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};
 