# Environment Variable Documentation

This document covers every environment variable used across the ClientOS monorepo.

---

## Backend (`backend/.env`)

Create this file by copying the example:
```bash
cp backend/.env.example backend/.env
```

| Variable | Required | Example Value | Description |
|----------|----------|---------------|-------------|
| `DATABASE_URL` | ✅ Yes | `postgresql://user:pass@localhost:5433/clientos_db?schema=public` | Full PostgreSQL connection string. Prisma uses this to connect to your database. |
| `JWT_SECRET` | ✅ Yes | `your_super_secret_key_here` | Secret key used to sign and verify JWT access tokens. Use a long random string in production. |
| `JWT_REFRESH_SECRET` | ✅ Yes | `your_refresh_secret_key` | Separate secret used to sign refresh tokens (longer-lived). Keep this different from `JWT_SECRET`. |
| `PORT` | ❌ Optional | `5000` | Port the Express server listens on. Defaults to `5000` if not set. |
| `REDIS_URL` | ❌ Optional | `redis://localhost:6379` | Redis connection URL. Used for refresh token invalidation (logout/revocation). If not set, refresh token blacklisting is skipped. |
| `RABBITMQ_URL` | ❌ Optional | `amqp://localhost:5672` | RabbitMQ connection URL. Used for push notification scheduling (tasks due tomorrow). If not set, push notifications are skipped gracefully. |

### Full example `backend/.env`

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://clientos_user:clientos_password@localhost:5433/clientos_db?schema=public"

# JWT Auth
JWT_SECRET="change_this_to_a_long_random_string_in_production"
JWT_REFRESH_SECRET="change_this_to_another_long_random_string"

# Server
PORT=5000

# Redis (optional — for refresh token blacklisting)
REDIS_URL="redis://localhost:6379"

# RabbitMQ (optional — for push notification queue)
RABBITMQ_URL="amqp://localhost:5672"
```

---

## Web App (`web/.env`)

Create this file inside the `web/` folder:

```bash
cp web/.env.example web/.env
```

| Variable | Required | Example Value | Description |
|----------|----------|---------------|-------------|
| `VITE_API_URL` | ✅ Yes | `http://localhost:5000/api` | Base URL for all backend API calls from the web app. Change this to your deployed backend URL in production. |

### Full example `web/.env`

```env
# Backend API Base URL
VITE_API_URL="http://localhost:5000/api"
```

> **For production:** Replace with your deployed backend domain, e.g., `https://api.yourdomain.com/api`.

---

## Mobile App

The mobile app does **not** use a `.env` file. The backend URL is resolved automatically at runtime using Expo's `hostUri`:

- **Physical device (Expo Go):** Automatically detects your machine's local IP over Wi-Fi — no config needed.
- **Android emulator:** Defaults to `http://10.0.2.2:5000/api` (Android's alias for `localhost`).
- **iOS simulator:** Defaults to `http://localhost:5000/api`.

If you're running against a **deployed backend**, open `mobile/src/api/axios.ts` and update the fallback URL at the bottom of the `getBaseUrl()` function:

```typescript
// Change this line to your production backend URL:
return 'http://localhost:5000/api';
// to:
return 'https://api.yourdomain.com/api';
```

---

## Docker Compose Environment

When using `docker compose up`, the environment variables are defined directly in `docker-compose.yml` at the project root. You don't need a `.env` file for Docker — they're already pre-configured for the containerized environment.

Key values used in Docker:
```yaml
DATABASE_URL: "postgresql://clientos_user:clientos_password@postgres:5432/clientos_db?schema=public"
JWT_SECRET: "docker_jwt_secret"
JWT_REFRESH_SECRET: "docker_refresh_secret"
REDIS_URL: "redis://redis:6379"
RABBITMQ_URL: "amqp://rabbitmq:5672"
```

> **Security note:** Never commit real `.env` files with production secrets to version control. The `.gitignore` in this project already excludes `.env` files.

---

## CI/CD (GitHub Actions)

The CI pipeline in `.github/workflows/ci.yml` injects its own environment variables for the test run:

| Variable | Value in CI |
|----------|-------------|
| `DATABASE_URL` | Points to the ephemeral PostgreSQL container spawned by the workflow |
| `JWT_SECRET` | `ci_test_secret` (safe for testing only) |

You don't need to configure anything for CI — it works out of the box.
