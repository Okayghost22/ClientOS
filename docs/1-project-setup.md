# Project Setup Instructions

Welcome to **ClientOS** — a full-stack client & project management platform. This guide will walk you through setting up all three parts of the application: the **Backend API**, the **Web app**, and the **Mobile app (Expo/React Native)**.

---

## Prerequisites

Make sure you have the following installed before you begin:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | v22+ | https://nodejs.org |
| npm | v10+ | (comes with Node.js) |
| PostgreSQL | v15+ | https://www.postgresql.org/download |
| Git | Latest | https://git-scm.com |
| Expo Go (optional) | Latest | App Store / Google Play |

---

## 1. Clone the Repository

```bash
git clone https://github.com/Okayghost22/ClientOS.git
cd ClientOS
```

---

## 2. Backend Setup

The backend is a Node.js + Express + Prisma API server.

### Step 1 — Install dependencies

```bash
cd backend
npm install
```

### Step 2 — Set up your environment variables

Create a `.env` file inside the `backend/` folder:

```bash
cp backend/.env.example backend/.env
```

Edit it with your actual values. See [2-environment-variables.md](./2-environment-variables.md) for full details.

### Step 3 — Set up the database

Make sure PostgreSQL is running, then run these two commands from inside the `backend/` folder:

```bash
npx prisma generate
npx prisma db push
```

This will create all required tables automatically — no manual SQL needed.

### Step 4 — Start the development server

```bash
npm run dev
```

The backend will start at: **http://localhost:5000**

Verify it's running by visiting: **http://localhost:5000/health** — you should see `{ "status": "ok" }`.

---

## 3. Shared Package Setup

The `shared` package contains Zod validation schemas used by both the backend and web app. Install and build it before running the web app.

```bash
cd shared
npm install
npm run build
```

---

## 4. Web App Setup

The web app is a React + Vite + TypeScript single-page application.

### Step 1 — Install dependencies

```bash
cd web
npm install
```

### Step 2 — Set up your environment variables

Create a `.env` file inside the `web/` folder:

```bash
cp web/.env.example web/.env
```

Set `VITE_API_URL` to your backend URL (e.g., `http://localhost:5000/api`).

### Step 3 — Start the development server

```bash
npm run dev
```

The web app will start at: **http://localhost:5173**

> **Note:** Make sure the backend is running before you open the web app, otherwise API calls will fail.

---

## 5. Mobile App Setup

The mobile app is built with Expo (React Native) and works on Android, iOS, and in the browser.

### Step 1 — Install dependencies

```bash
cd mobile
npm install
```

### Step 2 — Start the Expo development server

```bash
npm start
```

This opens the **Expo Dev Tools** in your browser. From there you can:

- Press `a` — open in Android emulator
- Press `i` — open in iOS simulator
- Scan the **QR code** with the **Expo Go** app on your physical phone

> **Important for physical device testing:** Your phone and computer must be on the **same Wi-Fi network**. The app auto-detects your machine's local IP through Expo's `hostUri` — no manual IP configuration needed.

---

## 6. Quick Start — Run Everything Together

Open three separate terminals from the project root:

```bash
# Terminal 1 — Backend API
cd backend && npm run dev

# Terminal 2 — Web App
cd web && npm run dev

# Terminal 3 — Mobile App
cd mobile && npm start
```

---

## 7. Running Tests

```bash
cd backend
npm test
```

This runs the full integration test suite (17 tests) against a live PostgreSQL database.

---

## 8. Running with Docker (Optional)

If you have Docker and Docker Compose installed, you can spin everything up with one command from the project root:

```bash
docker compose up --build
```

This automatically starts PostgreSQL, the backend API, and the web app in containers — no local PostgreSQL installation needed.

> See [2-environment-variables.md](./2-environment-variables.md) for environment variables when using Docker.
