const initDatabase = require('../src/config/init-db');
const app = require('../src/app');

initDatabase().catch(err => {
  console.error('Failed to initialize database:', err.message);
});

module.exports = app;
