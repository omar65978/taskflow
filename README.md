# TaskFlow — Project & Task Manager

> A full-stack demo project: **Laravel 11 REST API** (PHP, OOP, MVC, MySQL/MariaDB) + **React 18** SPA.
> Built to match a PHP/Laravel + React job description.

TaskFlow lets a user register, create projects, and manage tasks on a Kanban-style board
(to do → in progress → done). Every action goes through a JSON REST API protected by
token authentication.

## What it demonstrates

- **PHP / OOP**: Eloquent models with relationships, casts, route model binding
- **MVC**: routes → controllers → models (resource controllers)
- **REST API**: resource routes, validation, proper status codes (201 / 403 / 404 / 422), JSON error responses
- **Auth**: Laravel Sanctum token authentication (register / login / logout / me)
- **SQL**: migrations, foreign keys with cascade, `withCount`, eager loading, SQLite out of the box (MySQL/MariaDB ready)
- **React 18**: React Router, Context API, optimistic UI updates, a small hand-written fetch layer
- **Code quality**: PHPUnit feature tests, GitHub Actions CI, Postman collection, Pint-ready code style
- **Design**: a custom "warm paper & petrol" design system written in plain CSS (no UI framework)

## Project structure

```
01-taskflow/
├── backend/          Laravel 11 API (self-contained: clone → composer install → migrate → serve)
├── frontend/         React 18 + Vite SPA
├── postman/          Postman collection for the whole API
└── .github/workflows/CI (runs the backend test suite on every push)
```

## Run locally

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve          # http://localhost:8000
```

Demo account: **demo@taskflow.test / password**

> Tip: the default `.env.example` uses SQLite (zero setup). To practice with MySQL/MariaDB,
> switch `DB_CONNECTION` to `mysql` and fill in `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.

### Frontend

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173
```

If the API runs somewhere else, create `frontend/.env`:

```
VITE_API_URL=http://localhost:8000/api
```

## API overview

| Method | Endpoint | Auth | Description |
| ------ | -------- | ---- | ----------- |
| POST | `/api/register` | — | Register, returns user + token |
| POST | `/api/login` | — | Login, returns user + token |
| POST | `/api/logout` | ✅ | Revoke current token |
| GET | `/api/me` | ✅ | Current user |
| GET | `/api/projects` | ✅ | List my projects (with task counts) |
| POST | `/api/projects` | ✅ | Create project |
| GET | `/api/projects/{id}` | ✅ | Project with tasks |
| PUT | `/api/projects/{id}` | ✅ | Update project |
| DELETE | `/api/projects/{id}` | ✅ | Delete project |
| GET | `/api/projects/{id}/tasks` | ✅ | List tasks of a project |
| POST | `/api/projects/{id}/tasks` | ✅ | Create task |
| PUT | `/api/tasks/{id}` | ✅ | Update task |
| PATCH | `/api/tasks/{id}/status` | ✅ | Move task between columns |
| DELETE | `/api/tasks/{id}` | ✅ | Delete task |

Import `postman/TaskFlow.postman_collection.json` into Postman — the login request
automatically stores the token for the rest of the collection.

## Tests & CI

```bash
cd backend
php artisan test           # or: ./vendor/bin/phpunit
```

The GitHub Actions workflow in `.github/workflows/ci.yml` runs the same suite on every push.

## Deploy

- **Frontend** → Vercel: import the repo, set **Root Directory** to `frontend`,
  add env `VITE_API_URL=https://your-backend.example.com/api`.
- **Backend** → Railway / Laravel Cloud: import the repo, set **Root Directory** to `backend`,
  attach a MySQL database, set the env vars from `.env.example`, and run
  `php artisan migrate --seed --force` (and `php artisan storage:link`) on deploy.

See the top-level `README.md` in this workspace for the full deployment guide.

## License

MIT
