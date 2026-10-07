# Database Setup Instructions

ClientOS uses **PostgreSQL** as its primary database, managed through **Prisma ORM**. This document covers everything you need to get the database running locally, apply the schema, and understand the data model.

---

## Option A — Local PostgreSQL Setup (Recommended for Development)

### Step 1 — Install PostgreSQL

Download and install PostgreSQL 15+ from: https://www.postgresql.org/download

During installation, note your **postgres superuser password** — you'll need it shortly.

### Step 2 — Create the database and user

Open the PostgreSQL shell (`psql`) and run:

```sql
-- Create a dedicated user for ClientOS
CREATE USER clientos_user WITH PASSWORD 'clientos_password';

-- Create the database
CREATE DATABASE clientos_db OWNER clientos_user;

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE clientos_db TO clientos_user;
```

Or as a one-liner in the terminal:

```bash
psql -U postgres -c "CREATE USER clientos_user WITH PASSWORD 'clientos_password';"
psql -U postgres -c "CREATE DATABASE clientos_db OWNER clientos_user;"
```

### Step 3 — Configure your DATABASE_URL

Set the connection string in `backend/.env`:

```env
DATABASE_URL="postgresql://clientos_user:clientos_password@localhost:5433/clientos_db?schema=public"
```

> **Note:** The default PostgreSQL port is `5432`. If you're using port `5433` (e.g., to avoid conflicts with another Postgres instance), adjust accordingly.

### Step 4 — Apply the schema with Prisma

From inside the `backend/` folder:

```bash
# Generate the Prisma client
npx prisma generate

# Push the schema to the database (creates all tables)
npx prisma db push
```

That's it — all tables are created automatically. No SQL migration files to run manually.

---

## Option B — Docker (Zero Local Setup)

If you don't want to install PostgreSQL locally, just use Docker Compose from the project root:

```bash
docker compose up postgres
```

This starts a PostgreSQL 15 container with the correct user, password, and database already configured. Then run Prisma from the `backend/` folder:

```bash
cd backend
npx prisma generate
npx prisma db push
```

---

## Database Schema Overview

Here's a summary of every table in the database:

### `User`
Stores registered accounts.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `fullName` | String | User's display name |
| `email` | String | Unique, used for login |
| `passwordHash` | String | bcrypt-hashed password |
| `role` | Enum | `USER` or `ADMIN` |
| `createdAt` | DateTime | Auto-set on creation |
| `updatedAt` | DateTime | Auto-updated on changes |

### `Project`
Each project belongs to one user.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `name` | String | Project title |
| `description` | String? | Optional description |
| `clientName` | String? | Optional client name (free text) |
| `clientId` | UUID? | Optional FK to `Client` table |
| `status` | Enum | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` |
| `startDate` | DateTime? | Optional start date |
| `endDate` | DateTime? | Optional deadline |
| `userId` | UUID | FK to `User` (cascade delete) |

### `Task`
Tasks belong to a project and a user.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `name` | String | Task title |
| `description` | String? | Optional description |
| `priority` | Enum | `LOW`, `MEDIUM`, `HIGH` |
| `status` | Enum | `PENDING`, `IN_PROGRESS`, `COMPLETED` |
| `dueDate` | DateTime? | Optional due date |
| `projectId` | UUID | FK to `Project` (cascade delete) |
| `userId` | UUID | FK to `User` (cascade delete) |

### `Client`
Client contacts managed by a user.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `name` | String | Client's name |
| `email` | String? | Optional contact email |
| `phone` | String? | Optional phone |
| `company` | String? | Optional company |
| `status` | String | e.g., `PENDING`, `ACTIVE` |
| `userId` | UUID | FK to `User` (cascade delete) |

### `AuditLog`
Immutable record of all significant user actions.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `action` | String | e.g., `CREATE_PROJECT`, `DELETE_TASK` |
| `details` | String? | Extra context about the action |
| `userId` | UUID | FK to `User` (cascade delete) |
| `createdAt` | DateTime | When the action occurred |

### `Message`
Internal messaging between users.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `content` | String | Message body |
| `senderId` | UUID | FK to `User` |
| `receiverId` | UUID | FK to `User` |
| `createdAt` | DateTime | When sent |

---

## Useful Prisma Commands

```bash
# Open the visual Prisma Studio (GUI to browse your database)
npx prisma studio

# Reset the database (drops and recreates all tables — CAUTION: destroys all data)
npx prisma db push --force-reset

# Re-generate the Prisma client after schema changes
npx prisma generate

# View pending schema changes
npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script
```

---

## Data Isolation & Security

Every query in the API is automatically **scoped to the authenticated user's ID**. This means:

- User A cannot see, modify, or delete User B's projects, tasks, or clients.
- This is enforced at the **controller level** using the `userId` from the decoded JWT — not just at the route level.
- Cascade deletes are set up so that when a user is deleted, all their data is cleaned up automatically.
