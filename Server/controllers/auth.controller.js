// const BrandProfile = require('../models/BrandProfile'); 
// const User = require('../models/user');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// //upgraded version
// exports.register = async (req, res) => {
//     try {
//         const { name, email, password, role, company_name, website, target_audience } = req.body;

//         const existingUser = await User.findOne({ where: { email } });
//         if (existingUser) {
//             return res.status(400).json({ message: "Email is already registered." });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const user = await User.create({ 
//             name, 
//             email, 
//             password: hashedPassword, 
//             role 
//         });

//                 if (role === "brand") {
//                 const userId = user.user_id || user.id; 
            
//             await BrandProfile.create({
//                 // FIX: Changed 'brand_name' to 'company_name' to match your model
//                 company_name: company_name || name, 
//                 website: website || '',
//                 target_audience: target_audience || '',
//                 user_id: userId
//             });
//         }

//         return res.status(201).json({ message: "User registered successfully!" });

//     } catch (err) {
//         console.error("REGISTRATION ERROR:", err);
        
//         // --- CRITICAL FIX ---
//         // If BrandProfile creation fails, but the User was already created,
//         // your database is now out of sync. For now, let's at least 
//         // return the specific error message so you can see it in DevTools.
//         res.status(500).json({ message: err.message || "Internal Server Error" });
//     }
// };

// exports.login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // 1. Find the user
//         const user = await User.findOne({ where: { email } });
//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         // 2. Verify password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: "Invalid credentials" });
//         }

//         // 3. Logic: Get the best "Display Name" based on Role
//         let displayName = user.name; 

//         if (user.role === 'brand') {
//             // Check if a Brand Profile exists to get the Company/Brand Name
//             const brand = await BrandProfile.findOne({ 
//                 where: { user_id: user.user_id || user.id } 
//             });
//             if (brand && brand.brand_name) {
//                 displayName = brand.brand_name;
//             }
//         }

//         // 4. Generate JWT Token
//         const token = jwt.sign(
//             { id: user.user_id || user.id, role: user.role },
//             process.env.JWT_SECRET,
//             { expiresIn: '24h' }
//         );

//         // 5. Send Response with consistent "name" field
//         res.status(200).json({
//             message: "Login successful",
//             token,
//             user: {
//                 id: user.user_id || user.id,
//                 email: user.email,
//                 name: displayName, // Consistently sending the correct name
//                 role: user.role
//             }
//         });

//     } catch (err) {
//         console.error("Login Error:", err);
//         res.status(500).json({ error: err.message });
//     }
// };
  





const User = require('../models/user');
const BrandProfile = require('../models/BrandProfile');
const InfluencerProfile = require('../models/InfluencerProfile'); // Added!
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/db.config'); // Needed for transactions

exports.register = async (req, res) => {
    const t = await sequelize.transaction(); // Start a transaction
    try {
        const { name, email, password, role, company_name, website, target_audience } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            await t.rollback(); // Undo if email exists
            return res.status(400).json({ message: "Email is already registered." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Create the User
        const user = await User.create({ 
            name, 
            email, 
            password: hashedPassword, 
            role 
        }, { transaction: t });

        // 2a. Create Brand Profile if Brand
        if (role === "brand") {
            await BrandProfile.create({
                company_name: company_name || name, 
                website: website || '',
                target_audience: target_audience || '',
                user_id: user.user_id
            }, { transaction: t });
        } 
        // 2b. Create Influencer Profile if Influencer
        else if (role === "influencer") {
            await InfluencerProfile.create({
                user_id: user.user_id,
                bio: '',
                niche: '',
                followers_count: 0,
                social_links: {}
            }, { transaction: t });
        }

        await t.commit(); // Save to database
        return res.status(201).json({ message: "User registered successfully!" });

    } catch (err) {
        if (t) await t.rollback(); // Cancel transaction on error
        console.error("REGISTRATION ERROR:", err);
        res.status(500).json({ message: err.message || "Internal Server Error" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        let displayName = user.name; 

        if (user.role === 'brand') {
            const brand = await BrandProfile.findOne({ 
                where: { user_id: user.user_id } 
            });
            // FIX: Uses company_name instead of brand_name
            if (brand && brand.company_name) {
                displayName = brand.company_name;
            }
        }

        const token = jwt.sign(
            { id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.user_id,
                email: user.email,
                name: displayName,
                role: user.role
            }
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: err.message });
    }
};


