const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config()

const sql = mysql.createPool({
  host: 'localhost',
  // host: 'sql-container', // use this when using docker compose
  database: process.env.MYSQL_DATABASE,
  user: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD,
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

sql.getConnection((err) => {
  if (err) {
    console.log(err?.sqlMessage);
    return;
  }
  console.log("Database connected successfully!");
})

module.exports = sql.promise();