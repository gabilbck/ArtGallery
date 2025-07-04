// config/database.js
module.exports = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'artgallery_test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};