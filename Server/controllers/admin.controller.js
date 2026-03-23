const User = require('../models/user'); 
const Campaign = require('../models/Campaign');

exports.getAllUsers = async (req, res) => {
    try {
        
        const users = await User.findAll({
            attributes: ['user_id', 'name', 'email', 'role', 'is_verified']
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


exports.verifyUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [updatedRows] = await User.update(
            { is_verified: true },
            { where: { user_id: id } }
        );
        
        if (updatedRows === 0) {
            return res.status(404).json({ error: "User not found." });
        }
        
        res.status(200).json({ message: "User successfully verified!" });
    } catch (error) {
        console.error("Database error during verification:", error);
        res.status(500).json({ error: "Database error during verification", details: error.message });
    }
};

exports.getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        
        const pendingRequests = await User.count({ 
            where: { is_verified: false } 
        }); 
        
        res.json({
            usersVerified: totalUsers,
            pendingRequests: pendingRequests
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching stats" });
    }
};