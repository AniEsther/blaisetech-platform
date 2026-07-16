// // config/db.js
// // Connects our app to the MySQL database using Sequelize.
// // Sequelize lets us work with the database using JavaScript objects
// // instead of writing raw SQL for every single query.

// const { Sequelize } = require('sequelize');
// require('dotenv').config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT,
//     dialect: 'mysql',
//     logging: false, // set to console.log to see every SQL query Sequelize runs
//   }
// );

// module.exports = sequelize;

// config/db.js
// Connects our app to the MySQL database using Sequelize.

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
  }
);

module.exports = sequelize;

