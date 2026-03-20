const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./User');

const InfluencerProfile = sequelize.define('InfluencerProfile', {
    influencer_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    bio: { type: DataTypes.TEXT },
    niche: { type: DataTypes.STRING(100) },
    followers_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    social_links: { type: DataTypes.JSON } // Stores Instagram/YouTube links as an object
});

// Setting up the relationship 
User.hasOne(InfluencerProfile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
InfluencerProfile.belongsTo(User, { foreignKey: 'user_id' });

module.exports = InfluencerProfile;
