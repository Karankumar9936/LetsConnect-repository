const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./user');

const BrandProfile = sequelize.define('BrandProfile', {
    brand_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    company_name: { type: DataTypes.STRING, allowNull: false },
    website: { type: DataTypes.STRING },
    target_audience: { type: DataTypes.TEXT }
});

// Relationship: Each BrandProfile belongs to a User
User.hasOne(BrandProfile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
BrandProfile.belongsTo(User, { foreignKey: 'user_id' });

module.exports = BrandProfile;