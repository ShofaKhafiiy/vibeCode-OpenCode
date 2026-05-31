# Documentation

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL 9.x (Docker lokal / Railway MySQL plugin)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Frontend:** Vanilla JS + CSS (no framework)

## Project Structure

```
.
├── api/
│   └── index.js                # Vercel serverless entry (exports Express app)
├── public/                     # Static frontend (served by Vercel CDN)
│   ├── index.html              # Frontend HTML
│   ├── css/
│   │   └── style.css           # All styles
│   └── js/
│       ├── app.js              # Frontend entry (auth flow + API calls)
│       ├── api.js              # HTTP client for backend
│       ├── auth.js             # Token/user localStorage management
│       ├── storage.js          # (legacy) localStorage
│       ├── ui.js               # DOM rendering
│       ├── events.js           # Event delegation
│       ├── gestures.js         # Swipe-to-delete
│       └── theme.js            # Dark mode
├── src/                        # Backend only
│   ├── app.js                  # Entry point Express
│   ├── config/
│   │   ├── db.js               # MySQL connection pool
│   │   └── init-db.js          # Auto-create tables on startup
│   ├── models/
│   │   ├── user.model.js       # User queries
│   │   └── todo.model.js       # Todo queries
│   ├── controllers/
│   │   ├── auth.controller.js  # Register & login logic
│   │   ├── todo.controller.js  # Todo CRUD handlers
│   │   └── user.controller.js  # User handlers
│   ├── routes/
│   │   ├── auth.routes.js      # POST /register, /login
│   │   ├── todo.routes.js      # CRUD /todos (auth required)
│   │   └── user.routes.js      # GET /users, DELETE /users
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   ├── admin.js            # Admin-only authorization
│   │   └── errorHandler.js     # Global error handler
│   └── ...backend files only
├── vercel.json                 # Vercel deployment config
├── docker-compose.yml          # MySQL container
├── init.sql                    # Database schema
├── .env.example                # Environment template
└── package.json
```

## API Reference

### Health

```
GET /api/health
Response: { "status": "ok" }
```

### Auth

```
POST /api/auth/register
Body: { "name": string, "email": string, "password": string (min 6) }
Response: { "data": { "user": {...}, "token": string } }

POST /api/auth/login
Body: { "email": string, "password": string }
Response: { "data": { "user": {...}, "token": string } }
```

### Todos (all require Authorization: Bearer <token>)

```
GET    /api/todos           # List all todos for logged-in user
POST   /api/todos           # Create todo: { "text": string }
PUT    /api/todos/:id       # Update: { "text"?, "completed"? }
DELETE /api/todos/:id       # Delete
```

### Users

```
GET    /api/users                   # List all users (no auth)
GET    /api/users/:id               # Get user by ID (no auth)
GET    /api/users/profile           # Get own profile (auth required)
PUT    /api/users/profile           # Update profile: { name?, email?, currentPassword?, newPassword? } (auth required)
DELETE /api/users/profile           # Delete own account (auth required)
DELETE /api/users/:id               # Delete user by ID (auth required, admin can delete any)
DELETE /api/users/email             # Delete by email: { "email": string } (auth required)
```

### Admin (auth + admin role required)

```
GET    /api/users/admin/users           # List all users with count
GET    /api/users/admin/users/:id       # Get user by ID
PUT    /api/users/admin/users/:id       # Update user: { name?, email?, role? }
DELETE /api/users/admin/users/:id       # Delete any user
```

## Auth Flow

1. User registers via `/api/auth/register`
2. Server hashes password with bcrypt (10 salt rounds)
3. Server returns JWT token (default expiry: 7 days)
4. Frontend stores token + user info in localStorage
5. All /api/todos requests include `Authorization: Bearer <token>`
6. Auth middleware verifies token on every protected route
7. Logout clears localStorage

## Frontend Architecture (src/js/)

```
app.js (entry)
  ├── api.js       — fetch wrapper with JWT
  ├── auth.js      — localStorage token/user
  ├── ui.js        — renderTodos, removeTodoItem
  ├── events.js    — click/keyboard handlers
  ├── gestures.js  — swipe-to-delete touch handler
  └── theme.js     — dark mode toggle + localStorage
```

Flow:
1. App loads → check if token exists in localStorage
2. If token exists → fetch todos from API → render
3. If no token → show login/register forms
4. Register/Login → save token → fetch todos → render

## Database Schema

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE todos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  text VARCHAR(500) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Running Locally

### Prerequisites
- Node.js 18+
- Docker (for MySQL) or local MySQL

### Setup
```bash
git clone https://github.com/ShofaKhafiiy/vibeCode-OpenCode.git
cd vibeCode-OpenCode
npm install
cp .env.example .env
docker compose up -d    # Start MySQL
npm start               # Start server on :3000
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| PORT | 3000 | Server port |
| DB_HOST | localhost | MySQL host |
| DB_PORT | 3306 | MySQL port |
| DB_NAME | todo_db | Database name |
| DB_USER | todo_user | Database user |
| DB_PASSWORD | - | Database password |
| DB_ROOT_PASSWORD | - | MySQL root password |
| JWT_SECRET | - | Secret key for JWT signing |
| JWT_EXPIRES_IN | 7d | Token expiry duration |
| CORS_ORIGIN | * | Allowed CORS origin |
| NODE_ENV | development | Environment mode |

`DB_*` vars can also be injected by the hosting platform (e.g. Railway used `MYSQL_*` vars as fallback).

## Deployment (Vercel)

**Live URL:** https://todo-app-ecru-two-42.vercel.app

### Prerequisites

- MySQL-compatible database (e.g. [TiDB Serverless](https://tidbcloud.com) — 5GB free, no credit card)
- Vercel account (Hobby tier — free)

### Steps

1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import GitHub repo
3. In project settings, add Environment Variables:
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` — from your MySQL provider
   - `JWT_SECRET` — strong random string
   - `JWT_EXPIRES_IN` — e.g. `7d`
   - `CORS_ORIGIN` — your Vercel domain or `*`
4. Deploy — Vercel automatically detects `vercel.json`
5. Your app is live at `https://<project>.vercel.app`

### Notes

- Vercel runs Express as a **serverless function** — cold start ~1-3s after idle
- Static files (`public/`) are served via Vercel CDN, not Express
- Database tables auto-create on first request (lazy init in `api/index.js`)
- Local development still works with `npm start` (Express serves `public/`)

### Database providers (free tier)

| Provider | Type | Free tier | CC required |
|---|---|---|---|
| [TiDB Serverless](https://tidbcloud.com) | MySQL-compatible | 5GB | No |
| [PlanetScale](https://planetscale.com) | MySQL-compatible (Vitess) | 5GB | Yes |
| [Aiven](https://aiven.io) | MySQL | 1GB | Yes |

## Middleware Chain

```
Request
  → helmet (security headers, CSP disabled)
  → cors (configurable origin)
  → express.json (body parser)
  → rate-limit (20 req/15min on /api/auth)
  → routes
    → auth middleware (JWT verify for protected routes)
      → controller
        → model (MySQL query)
  → errorHandler (500 fallback)
```

## Error Handling

All controllers use try/catch with `next(err)`. The global error handler returns:

```json
{ "error": "Error message here" }
```

HTTP status codes:
- 400 — Validation error (missing fields, short password)
- 401 — Invalid credentials or expired JWT
- 403 — Not authorized (wrong user)
- 404 — Resource not found
- 409 — Email already registered
- 429 — Rate limit exceeded
- 500 — Internal server error
