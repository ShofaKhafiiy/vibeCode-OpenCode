require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const todoRoutes = require('./routes/todo.routes');
const errorHandler = require('./middleware/errorHandler');
const initDatabase = require('./config/init-db');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

if (!process.env.VERCEL) {
  const publicPath = path.join(__dirname, '..', 'public');
  app.use(express.static(publicPath));
}

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  initDatabase().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
}

module.exports = app;
