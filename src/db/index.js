const mysql = require("mysql2");
const dotenv = require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: "gum",
});

module.exports = connection;

// connection.connect();

// connection.end();
