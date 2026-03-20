const User = require('../models/User'); // Ensure this path matches your User model
const Campaign = require('../models/Campaign');

exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all users, but exclude their passwords for security
        const users = await User.findAll({
            attributes: ['user_id', 'name', 'email', 'role']
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.destroy({ where: { user_id: id } });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
};

// function to get system stats
exports.getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        // Assuming 'pending' is a status in your users or applications table
        const pendingRequests = await User.count({ where: { role: 'influencer' } }); 
        
        res.json({
            usersVerified: totalUsers,
            pendingRequests: pendingRequests // You can customize this logic
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching stats" });
    }
};