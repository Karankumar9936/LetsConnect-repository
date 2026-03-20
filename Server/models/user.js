 const { DataTypes } = require('sequelize');
const sequelize = require('../config/db.config');

const User = sequelize.define('user', {
    user_id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true,    // Capital 'K' is required
        autoIncrement: true 
    },
    name: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    email: { 
        type: DataTypes.STRING, 
        unique: true, 
        allowNull: false,
        validate: { 
            isEmail: true    // Ensures data integrity at the app level
        } 
    },
    password: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    role: { 
        type: DataTypes.ENUM('influencer', 'brand', 'admin'), 
        allowNull: false,
        defaultValue: 'influencer' // Sets a default if you don't provide one
    },
    is_verified: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    }
});

module.exports = User;