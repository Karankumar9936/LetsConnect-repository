 const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const Message = sequelize.define('Message', {
    message_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    // NEW: Unique Room ID (CampaignId + InfluencerId)
    room_id: {
        type: DataTypes.STRING,
        allowNull: false // This must be provided to keep chats separate
    },
    campaign_id: { 
        type: DataTypes.INTEGER, 
        allowNull: true 
    },
    sender_id: { 
        type: DataTypes.INTEGER, 
        allowNull: true 
    },
    receiver_id: { 
        type: DataTypes.INTEGER, 
        allowNull: true 
    },
    message_text: { 
        type: DataTypes.TEXT, 
        allowNull: true
    }
}, { 
    timestamps: true 
});

module.exports = Message;