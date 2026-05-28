# Todo App

Todo app sederhana dengan fitur login/register dan database MySQL.

**Tech Stack:** Node.js, Express, MySQL, JWT, Docker

## Live Demo

[https://vibecode-opencode-production.up.railway.app](https://vibecode-opencode-production.up.railway.app)

## Fitur

- Register & Login (JWT)
- CRUD Todo list
- Dark mode
- Responsive mobile
- Swipe to delete

## Cara Jalankan Lokal

### 1. Clone & install

```bash
git clone https://github.com/ShofaKhafiiy/vibeCode-OpenCode.git
cd vibeCode-OpenCode
npm install
```

### 2. Setup MySQL

**Pakai Docker (recommended):**

```bash
cp .env.example .env
docker compose up -d
```

Atau pakai MySQL yang sudah terinstall di lokal, sesuaikan `.env`.

### 3. Jalankan

```bash
npm start
```

Buka `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | - | Register user baru |
| POST | `/api/auth/login` | - | Login |
| GET | `/api/todos` | ✅ | Ambil todos |
| POST | `/api/todos` | ✅ | Tambah todo |
| PUT | `/api/todos/:id` | ✅ | Update todo |
| DELETE | `/api/todos/:id` | ✅ | Hapus todo |
| DELETE | `/api/users/email` | ✅ | Hapus user by email |
| DELETE | `/api/users/:id` | ✅ | Hapus user by id |

## Struktur Project

```
src/
├── config/        # Koneksi database
├── controllers/   # Logic handler
├── middleware/     # Auth, error handler
├── models/        # Query database
├── routes/        # Definisi route
├── js/            # Frontend JS
├── css/           # Stylesheet
└── app.js         # Entry point
```

## Environment Variables

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=todo_db
DB_USER=todo_user
DB_PASSWORD=your_password
JWT_SECRET=your_secret
CORS_ORIGIN=*
```
