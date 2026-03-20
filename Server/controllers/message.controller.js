// const Message = require('../models/message');

// exports.getChatHistory = async (req, res) => {
//     try {
//         const { roomId } = req.params;

//         // Fetch messages for this room, ordered by time
//         const history = await Message.findAll({
//             where: { campaign_id: roomId },
//             order: [['createdAt', 'ASC']] // Shows oldest messages first
//         });

//         res.status(200).json(history);
//     } catch (error) {
//         console.error("Error fetching chat history:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };


//new

const Message = require('../models/message'); // Ensure Capital 'M' if your file is Message.js

exports.getChatHistory = async (req, res) => {
    try {
        const { roomId } = req.params;

        const history = await Message.findAll({
            // Ensure this column name matches your Message.js model exactly
            where: { room_id: roomId }, 
            // If you enabled 'timestamps: true' in the model, use 'createdAt'
            // If you used 'timestamp' manually, change this to 'timestamp'
            order: [['createdAt', 'ASC']] 
        });

        res.status(200).json(history);
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};