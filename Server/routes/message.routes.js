// const express = require('express');
// const router = express.Router();
// const Message = require('../models/message'); 
// const verifyToken = require('../middleware/auth.middleware'); // Ensure you have this path correct

// // GET: Fetch chat history for a specific campaign
// // Using :campaignId to match your database field name
// router.get('/history/:campaignId', verifyToken, async (req, res) => {
//     try {
//         const messages = await Message.findAll({
//             where: { 
//                 campaign_id: req.params.campaignId 
//             },
//             // Using 'timestamp' as per your second model's definition
//             order: [['timestamp', 'ASC']] 
//         });

//         if (!messages) {
//             return res.status(404).json({ message: "No messages found for this campaign." });
//         }

//         res.json(messages);
//     } catch (error) {
//         console.error("Error fetching chat history:", error);
//         res.status(500).json({ message: "Server error while retrieving chat history." });
//     }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// GET: /api/chat/history/:roomId
// This matches your controller's expectation of "roomId" in req.params
router.get('/history/:roomId', verifyToken, messageController.getChatHistory);

module.exports = router;