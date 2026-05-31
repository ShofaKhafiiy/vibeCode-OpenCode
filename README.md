# Todo App

Todo app sederhana dengan fitur login/register dan database MySQL.

**Tech Stack:** Node.js, Express, MySQL (TiDB Serverless), JWT, Docker

## Live Demo

[https://todo-app-ecru-two-42.vercel.app](https://todo-app-ecru-two-42.vercel.app)

## Fitur

- Register & Login (JWT)
- CRUD Todo list
- Dark mode
- Responsive mobile
- Swipe to delete
- **Update profil** (nama, email, password)
- **Hapus akun sendiri** dengan konfirmasi ganda
- **Admin panel** — lihat & hapus semua user (role-based)

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
| GET | `/api/users/profile` | ✅ | Ambil profil sendiri |
| PUT | `/api/users/profile` | ✅ | Update profil (name, email, password) |
| DELETE | `/api/users/profile` | ✅ | Hapus akun sendiri |
| DELETE | `/api/users/email` | ✅ | Hapus user by email |
| DELETE | `/api/users/:id` | ✅ | Hapus user by id |
| GET | `/api/users/admin/users` | ✅ (admin) | Lihat semua user |
| PUT | `/api/users/admin/users/:id` | ✅ (admin) | Update user |
| DELETE | `/api/users/admin/users/:id` | ✅ (admin) | Hapus user |

## Struktur Project

```
├── api/            # Vercel serverless entry
├── public/         # Frontend (static)
│   ├── css/
│   ├── js/
│   └── index.html
├── src/            # Backend
│   ├── config/     # Koneksi database
│   ├── controllers/# Logic handler
│   ├── middleware/  # Auth, error handler
│   ├── models/     # Query database
│   ├── routes/     # Definisi route
│   └── app.js      # Entry point
└── vercel.json     # Vercel config
```

## Environment Variables

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=todo_db
DB_USER=todo_user
DB_PASSWORD=your_password
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=*
```

## Lisensi

Didistribusikan di bawah lisensi MIT. Lihat file `LICENSE` untuk informasi lebih lanjut.

Copyright © 2026 ShofaKhafiiy

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
