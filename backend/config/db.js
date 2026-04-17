const mysql=require('mysql2')

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 50, // Max concurrent connections
  queueLimit: 50 // 0 = No limit on waiting requests
});

module.exports = db; 
