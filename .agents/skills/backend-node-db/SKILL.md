---
name: backend-node-db
description: Build backend API with Node.js/Express and MySQL via Docker with clean modular architecture
---

# Backend Node.js + MySQL Docker Skill

## Rules

- Modular architecture: separate routes, controllers, models, config
- Use environment variables for all config (port, DB creds, etc.)
- MySQL runs in Docker container, NOT installed directly on host
- Use `mysql2` (promise-based) for database connection
- Use Express.js as the web framework
- Use `docker-compose.yml` for reproducible MySQL setup
- Always handle errors with proper HTTP status codes
- Use `.env` files (via `dotenv`) for environment config
- Validate input on every endpoint
- Use `cors` and `helmet` middleware for security
- Prefer async/await over raw promises or callbacks

## Architecture

```
project/
 ├── src/
 │   ├── config/
 │   │   └── db.js              (MySQL connection pool)
 │   ├── models/
 │   │   └── user.model.js       (SQL queries wrapped in functions)
 │   ├── routes/
 │   │   └── user.routes.js      (Express Router definitions)
 │   ├── controllers/
 │   │   └── user.controller.js  (request handlers, validation)
 │   ├── middleware/
 │   │   └── errorHandler.js     (global error handler)
 │   └── app.js                  (Express app setup)
 ├── docker-compose.yml          (MySQL container definition)
 ├── .env                        (environment variables)
 ├── .env.example                (template for .env)
 ├── init.sql                    (optional: schema init SQL)
 └── package.json
```

## Docker MySQL Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: todo-mysql
    restart: unless-stopped
    ports:
      - "${DB_PORT:-3306}:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mysql_data:
```

## Environment (.env.example)

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=todo_db
DB_USER=todo_user
DB_PASSWORD=your_secure_password
DB_ROOT_PASSWORD=root_password

NODE_ENV=development
```

## Database Connection (src/config/db.js)

```js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
```

## Model Example (src/models/user.model.js)

```js
const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query('SELECT id, name, email FROM users');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

async function create({ name, email }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email]
  );
  return { id: result.insertId, name, email };
}

module.exports = { findAll, findById, create };
```

## Controller Example (src/controllers/user.controller.js)

```js
const userModel = require('../models/user.model');

async function getAll(req, res, next) {
  try {
    const users = await userModel.findAll();
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
    const user = await userModel.create({ name, email });
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, getById, create };
```

## Route Example (src/routes/user.routes.js)

```js
const { Router } = require('express');
const controller = require('../controllers/user.controller');

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);

module.exports = router;
```

## App Setup (src/app.js)

```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const userRoutes = require('./routes/user.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
```

## Error Handler (src/middleware/errorHandler.js)

```js
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
}

module.exports = errorHandler;
```

## Workflow

### 1. Initialize project

```bash
npm init -y
npm install express mysql2 dotenv cors helmet
npm install -D nodemon
```

Add to `package.json` scripts:
```json
"scripts": {
  "start": "node src/app.js",
  "dev": "nodemon src/app.js"
}
```

### 2. Start MySQL via Docker

```bash
docker compose up -d
docker compose ps                    # verify container is running
docker compose logs mysql            # check startup logs
```

### 3. Create database schema (init.sql)

```sql
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  text VARCHAR(500) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

The `init.sql` is automatically executed by the MySQL container on first start (mounted at `/docker-entrypoint-initdb.d/`). For subsequent container rebuilds, delete the volume first:

```bash
docker compose down -v && docker compose up -d
```

### 4. Set up environment

Copy `.env.example` to `.env` and adjust values. Never commit `.env` to git.

### 5. Connect and verify

```bash
curl http://localhost:3000/api/health
# → { "status": "ok" }

curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'
# → { "data": { "id": 1, "name": "John", "email": "john@example.com" } }
```

## Verification

- [ ] `docker compose up -d` starts MySQL without errors
- [ ] `node src/app.js` starts without crashing
- [ ] `GET /api/health` returns `200 { "status": "ok" }`
- [ ] `POST /api/users` creates a user and returns `201`
- [ ] `GET /api/users` returns list of users
- [ ] `GET /api/users/:id` returns a single user
- [ ] `GET /api/users/:id` returns `404` for non-existent user
- [ ] `POST /api/users` with missing fields returns `400`
- [ ] Database data persists after `docker compose restart`
- [ ] `.env` is listed in `.gitignore`
