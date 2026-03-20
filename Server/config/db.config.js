 require('dotenv').config(); // This looks for a file named exactly ".env"
const { Sequelize } = require('sequelize');

console.log("DEBUG: Attempting connection with User:", process.env.DB_USER);

const sequelize = new Sequelize(
    process.env.DB_NAME, 
    process.env.DB_USER, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
        port: process.env.DB_PORT || 3306
    }
);

module.exports = sequelize;