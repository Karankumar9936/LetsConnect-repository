// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db.config');
// const User = require('./user');
// const Campaign = require('./Campaign');

// const Application = sequelize.define('Application', {
//     application_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
//     message: { type: DataTypes.TEXT }, // Influencer's pitch to the brand
//     status: { 
//         type: DataTypes.ENUM('pending', 'accepted', 'rejected'), 
//         defaultValue: 'pending' 
//     }
// });

// // Relationships
// User.hasMany(Application, { foreignKey: 'influencer_id' });
// Application.belongsTo(User, { foreignKey: 'influencer_id', targetKey:'user_id' });

// Campaign.hasMany(Application, { foreignKey: 'campaign_id' });
// Application.belongsTo(Campaign, { foreignKey: 'campaign_id' });

// module.exports = Application;






const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');
const User = require('./user');
const Campaign = require('./Campaign');

const Application = sequelize.define('Application', {
    application_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    message: { type: DataTypes.TEXT }, // Influencer's pitch to the brand
    status: { 
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'), 
        defaultValue: 'pending' 
    },
    // CRITICAL: Explicitly define foreign keys to prevent crashes
    campaign_id: { type: DataTypes.INTEGER, allowNull: false },
    influencer_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
    // CRITICAL: Capitalize first letter to follow your rule!
    tableName: 'Applications', 
    freezeTableName: true,
    timestamps: true
});

// Relationships
User.hasMany(Application, { foreignKey: 'influencer_id' });
Application.belongsTo(User, { foreignKey: 'influencer_id', targetKey:'user_id' });

Campaign.hasMany(Application, { foreignKey: 'campaign_id' });
Application.belongsTo(Campaign, { foreignKey: 'campaign_id' });

module.exports = Application;