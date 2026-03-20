//  require('dotenv').config(); // This looks for a file named exactly ".env"
// const { Sequelize } = require('sequelize');

// console.log("DEBUG: Attempting connection with User:", process.env.DB_USER);

// const sequelize = new Sequelize(
//     process.env.DB_NAME, 
//     process.env.DB_USER, 
//     process.env.DB_PASSWORD, 
//     {
//         host: process.env.DB_HOST,
//         dialect: 'mysql',
//         logging: false,
//         port: process.env.DB_PORT || 17003,
//         ssl:{ rejectUnauthorized: false } // Required for Aiven
//     }
// );

// module.exports = sequelize;



const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Aiven MySQL Connected Successfully");
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err.message);
  });

module.exports = sequelize;