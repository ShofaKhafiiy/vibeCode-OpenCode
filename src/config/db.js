const mysql = require('mysql2/promise');

function getConfig() {
  if (process.env.MYSQL_URL) {
    return { uri: process.env.MYSQL_URL };
  }

  return {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306),
    user: process.env.DB_USER || process.env.MYSQL_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'todo_db',
  };
}

const config = getConfig();

const pool = mysql.createPool({
  ...(config.uri ? { uri: config.uri } : config),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
