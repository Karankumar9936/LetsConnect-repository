const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const BrandProfile = require('./BrandProfile');

const Campaign = sequelize.define('Campaign', {
    campaign_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    title: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    description: { 
        type: DataTypes.TEXT, 
        allowNull: false 
    },
    budget: { 
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false 
    },
    platform: { 
        type: DataTypes.STRING, // e.g., "Instagram", "YouTube", "LinkedIn"
        allowNull: false
    },
    requirements: {
        type: DataTypes.TEXT // e.g., "Minimum 5k followers"
    },
    status: { 
        type: DataTypes.ENUM('open', 'closed', 'completed'), 
        defaultValue: 'open' 
    }
});

// Define Relationships
// A Brand can post many campaigns
BrandProfile.hasMany(Campaign, { foreignKey: 'brand_id', onDelete: 'CASCADE' });
Campaign.belongsTo(BrandProfile, { foreignKey: 'brand_id' });

module.exports = Campaign;