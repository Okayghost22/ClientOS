# ClientOS — Full-Stack Client & Project Management Platform

A production-grade, full-stack monorepo application for managing clients, projects, and tasks — built with **React**, **React Native (Expo)**, **Node.js**, **Express**, **PostgreSQL**, and **Prisma**.

---

## What's Inside

```
ClientOS/
├── backend/        # Node.js + Express REST API (TypeScript + Prisma)
├── web/            # React + Vite web application (TypeScript + Tailwind)
├── mobile/         # Expo React Native mobile app (iOS + Android)
├── shared/         # Shared Zod validation schemas (used by backend + web)
├── docs/           # Full documentation (start here!)
├── .github/        # GitHub Actions CI/CD pipeline
└── docker-compose.yml  # Run entire stack with Docker
```

---

## Documentation

| # | Document | Description |
|---|----------|-------------|
| 1 | [Project Setup Instructions](./docs/1-project-setup.md) | How to clone, install, and run all three apps |
| 2 | [Environment Variables](./docs/2-environment-variables.md) | Every `.env` variable explained |
| 3 | [Database Setup](./docs/3-database-setup.md) | PostgreSQL setup, Prisma commands, schema overview |
| 4 | [API Documentation](./docs/4-api-documentation.md) | All REST endpoints with request/response examples |
| 5 | [Mobile Backend Connection](./docs/5-mobile-backend-connection.md) | How to run the mobile app against a deployed backend |

**👉 Start with [Project Setup](./docs/1-project-setup.md) if you're a new developer.**

---

## Quick Start (TL;DR)

```bash
# 1. Clone the repo
git clone https://github.com/Okayghost22/ClientOS.git
cd ClientOS

# 2. Install & start backend
cd backend && npm install && npm run dev

# 3. Install & start web app (new terminal)
cd web && npm install && npm run dev

# 4. Install & start mobile app (new terminal)
cd mobile && npm install && npm start

# OR — run everything with Docker (single command)
docker compose up --build
```

---

## Tech Stack

### Backend
- **Runtime:** Node.js (v22)
- **Framework:** Express.js v5
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL 15
- **Auth:** JWT (access + refresh tokens)
- **Validation:** Zod
- **Queue:** RabbitMQ (push notifications)
- **Cache:** Redis (token blacklisting)

### Web
- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **HTTP:** Axios

### Mobile
- **Framework:** Expo (React Native)
- **Language:** TypeScript
- **Navigation:** React Navigation
- **Storage:** Expo Secure Store
- **HTTP:** Axios

---

## Features

| Feature | Status |
|---------|--------|
| User Authentication (JWT) | ✅ Complete |
| Refresh Tokens | ✅ Complete |
| Project Management (CRUD) | ✅ Complete |
| Task Management (CRUD) | ✅ Complete |
| Client Management (CRUD) | ✅ Complete |
| Dashboard & Analytics | ✅ Complete |
| Pagination & Sorting | ✅ Complete |
| Audit Logs | ✅ Complete |
| Role-Based Access Control | ✅ Complete |
| Push Notifications (tasks due tomorrow) | ✅ Complete |
| Offline Viewing (mobile) | ✅ Complete |
| Shared Validation (Zod) | ✅ Complete |
| Docker Support | ✅ Complete |
| Integration Tests (17 tests) | ✅ Complete |
| CI/CD Pipeline (GitHub Actions) | ✅ Complete |

---

## CI/CD

Every push to `main` automatically:
1. Installs all dependencies
2. Runs Prisma DB migrations
3. Type-checks backend and web
4. Runs all 17 integration tests
5. Verifies Docker builds

View pipeline status: [GitHub Actions](https://github.com/Okayghost22/ClientOS/actions)

---

## Running Tests

```bash
cd backend
npm test
```

---

## License

ISC
