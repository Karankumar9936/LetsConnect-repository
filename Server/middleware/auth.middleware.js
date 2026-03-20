const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    // Get token from the 'Authorization' header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>

    if (!token) {
        return res.status(403).json({ message: "A token is required for authentication" });
    }

    try {
        // Verify token using your secret key from .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adds user info (id, role) to the request object 
    } catch (err) {
        return res.status(401).json({ message: "Invalid Token" });
    }
    return next(); // Proceed to the Controller logic 
};

// Middleware to check if the user is an Admin
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" }); 
    }
    next();
};
