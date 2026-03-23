 // --- 1. CONFIGURATION & IMPORTS ---
const express = require('express');
const http = require('http'); 
const { Server } = require('socket.io'); 
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db.config');

const Message = require('./models/message'); 
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const campaignRoutes = require('./routes/campaign.routes');
const applicationRoutes = require('./routes/application.routes');
const brandRoutes = require('./routes/brand.routes');
const messageRoutes = require('./routes/message.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const server = http.createServer(app); 

// --- 2. ---
// This tells the backend API to accept requests from your frontend
app.use(cors({
    origin: [
        "https://letsconnect99.netlify.app", 
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

// --- 3. SOCKET.IO SETUP ---
const io = new Server(server, {
    cors: {
        origin: [
            "https://letsconnect99.netlify.app", 
            "http://127.0.0.1:5500",
            "http://localhost:5500"
        ],
        methods: ["GET", "POST"]
    }
});

// --- 4. ROUTE USAGE ---
app.use('/api/chat', messageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('Let\'s Connect API with Private Chat is running...');
});

// --- 5. SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
    console.log('New User Connected:', socket.id);

    // Join a specific unique room (e.g., "10_5" -> Campaign 10, Influencer 5)
    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined private room: ${roomId}`);
    });

    // Send and Save Message to a specific room
    socket.on('send_message', async (data) => {
        try {
            await Message.create({
                room_id: data.room,          
                campaign_id: data.campaign_id,
                sender_id: data.sender_id,
                message_text: data.message
            });

            io.to(data.room).emit('receive_message', {
                room: data.room,
                message: data.message,
                sender_id: data.sender_id
            });
            
            console.log(`Message saved and sent to room: ${data.room}`);
        } catch (err) {
            console.error("Database Error in Socket send_message:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// --- 6. SYNC DB & START SERVER ---
const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: false }) 
    .then(() => {
        console.log("Database connected and synced (room_id added).");
        server.listen(PORT, () => {
            console.log(`=======================================`);
            console.log(` Server running on port ${PORT}`);
            console.log(` Socket.io initialized for Private Chat`);
            console.log(`=======================================`);
        });
    })
    .catch(err => {
        console.error("Failed to sync database: " + err.message);
    });