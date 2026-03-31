const mysql=require('mysql2')
const db = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 10, // Max concurrent connections
  queueLimit: 0        // 0 = No limit on waiting requests
});
