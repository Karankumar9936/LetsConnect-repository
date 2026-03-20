const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
// Assuming you have an auth middleware to verify tokens
const { verifyToken } = require('../middleware/auth.middleware'); 

// GET all users for the admin list
router.get('/users', verifyToken, adminController.getAllUsers);

// DELETE a user
router.delete('/users/:id', verifyToken, adminController.deleteUser);

router.get('/stats', verifyToken, adminController.getSystemStats);

module.exports = router;