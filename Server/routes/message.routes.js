 
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// GET: /api/chat/history/:roomId
// matches controller's expectation of "roomId" in req.params
router.get('/history/:roomId', verifyToken, messageController.getChatHistory);

module.exports = router;