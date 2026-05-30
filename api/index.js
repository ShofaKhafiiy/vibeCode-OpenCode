const initDatabase = require('../src/config/init-db');
const app = require('../src/app');

let initialized = false;

module.exports = async (req, res) => {
  if (!initialized) {
    try {
      await initDatabase();
      initialized = true;
      console.log('Database initialized');
    } catch (err) {
      console.error('Database init failed:', err.message);
    }
  }
  return app(req, res);
};
