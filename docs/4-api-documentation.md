# API Documentation

**Base URL:** `http://localhost:5000/api`

All endpoints (except Auth) require a valid JWT access token in the `Authorization` header:
```
Authorization: Bearer <your_access_token>
```

Tokens are obtained from the login or signup endpoints below.

---

## Authentication (`/api/auth`)

These endpoints do not require a token.

### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response `201`:**
```json
{
  "message": "User registered successfully",
  "token": "<access_token>",
  "refreshToken": "<refresh_token>",
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

---

### `POST /api/auth/login`
Log in with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response `200`:**
```json
{
  "message": "Login successful",
  "token": "<access_token>",
  "refreshToken": "<refresh_token>",
  "user": {
    "id": "uuid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

---

### `POST /api/auth/refresh`
Get a new access token using a refresh token (no auth header needed).

**Request Body:**
```json
{
  "refreshToken": "<your_refresh_token>"
}
```

**Response `200`:**
```json
{
  "token": "<new_access_token>"
}
```

---

### `GET /api/auth/me` 🔒
Get the currently authenticated user's profile.

**Response `200`:**
```json
{
  "id": "uuid",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### `POST /api/auth/logout` 🔒
Log out (invalidates the refresh token server-side).

**Response `200`:**
```json
{ "message": "Logged out successfully" }
```

---

## Projects (`/api/projects`) 🔒

All project endpoints require authentication. Users can only access their own projects.

### `POST /api/projects`
Create a new project.

**Request Body:**
```json
{
  "name": "Website Redesign",
  "description": "Full redesign of the company website",
  "clientName": "Acme Corp",
  "status": "NOT_STARTED",
  "startDate": "2024-01-15",
  "endDate": "2024-03-31"
}
```

**Status values:** `NOT_STARTED` | `IN_PROGRESS` | `COMPLETED`

**Response `201`:**
```json
{
  "message": "Project created successfully",
  "project": { "id": "uuid", "name": "Website Redesign", "..." }
}
```

---

### `GET /api/projects`
Get all projects for the authenticated user. Supports pagination and sorting.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page |
| `sortBy` | string | `createdAt` | Field to sort by |
| `sortOrder` | string | `desc` | `asc` or `desc` |
| `status` | string | — | Filter by status |
| `search` | string | — | Search by project name |

**Response `200`:**
```json
{
  "projects": [ { "..." } ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

### `GET /api/projects/:id`
Get a single project by ID.

**Response `200`:** Returns the project object with its tasks.

---

### `PUT /api/projects/:id` / `PATCH /api/projects/:id`
Update a project. Send only the fields you want to change.

**Request Body (any of these):**
```json
{
  "name": "New Name",
  "status": "IN_PROGRESS",
  "endDate": "2024-04-15"
}
```

---

### `DELETE /api/projects/:id`
Delete a project and all its associated tasks.

**Response `200`:**
```json
{ "message": "Project deleted successfully" }
```

---

## Tasks (`/api/tasks`) 🔒

All task endpoints require authentication. Users can only access tasks they created.

### `POST /api/tasks`
Create a new task.

**Request Body:**
```json
{
  "name": "Design mockups",
  "description": "Create Figma wireframes for all pages",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2024-02-01",
  "projectId": "<project_uuid>"
}
```

**Priority values:** `LOW` | `MEDIUM` | `HIGH`
**Status values:** `PENDING` | `IN_PROGRESS` | `COMPLETED`

**Response `201`:**
```json
{ "message": "Task created successfully", "task": { "..." } }
```

---

### `GET /api/tasks`
Get all tasks for the authenticated user. Supports pagination and sorting.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | `1` | Page number |
| `limit` | number | `20` | Items per page |
| `sortBy` | string | `createdAt` | Field to sort by (`dueDate`, `priority`, `status`) |
| `sortOrder` | string | `desc` | `asc` or `desc` |
| `status` | string | — | Filter by task status |
| `priority` | string | — | Filter by priority |

---

### `GET /api/tasks/:id`
Get a single task by ID.

---

### `GET /api/tasks/project/:projectId`
Get all tasks belonging to a specific project.

---

### `PUT /api/tasks/:id` / `PATCH /api/tasks/:id`
Update a task. Send only the fields you want to change.

---

### `PATCH /api/tasks/:id/status`
Quickly update just the status of a task.

**Request Body:**
```json
{ "status": "COMPLETED" }
```

---

### `DELETE /api/tasks/:id`
Delete a task.

**Response `200`:**
```json
{ "message": "Task deleted successfully" }
```

---

## Clients (`/api/clients`) 🔒

Manage client contacts. All clients belong to the authenticated user.

### `GET /api/clients`
Get all clients for the authenticated user.

### `GET /api/clients/:id`
Get a single client by ID.

### `POST /api/clients`
Create a new client.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@acme.com",
  "phone": "+1-555-1234",
  "company": "Acme Corp",
  "status": "ACTIVE"
}
```

### `PUT /api/clients/:id` / `PATCH /api/clients/:id`
Update client details.

### `DELETE /api/clients/:id`
Delete a client.

---

## Dashboard (`/api/dashboard`) 🔒

### `GET /api/dashboard`
Get a summary of all activity for the authenticated user.

**Response `200`:**
```json
{
  "totalProjects": 5,
  "totalTasks": 23,
  "totalClients": 8,
  "tasksByStatus": {
    "PENDING": 10,
    "IN_PROGRESS": 7,
    "COMPLETED": 6
  },
  "projectsByStatus": {
    "NOT_STARTED": 1,
    "IN_PROGRESS": 3,
    "COMPLETED": 1
  },
  "recentProjects": [ { "..." } ],
  "recentTasks": [ { "..." } ]
}
```

---

## Audit Logs (`/api/audit-logs`) 🔒

### `GET /api/audit-logs`
Get the audit log history for the authenticated user. Supports pagination.

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| `page` | number | `1` |
| `limit` | number | `20` |

**Response `200`:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "action": "CREATE_PROJECT",
      "details": "Created project: Website Redesign",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": { "total": 50, "page": 1, "limit": 20, "totalPages": 3 }
}
```

**Logged actions include:** `CREATE_PROJECT`, `UPDATE_PROJECT`, `DELETE_PROJECT`, `CREATE_TASK`, `UPDATE_TASK`, `DELETE_TASK`, `CREATE_CLIENT`, `UPDATE_CLIENT`, `DELETE_CLIENT`

---

## Health Check

### `GET /health`
Check if the backend server is running. No authentication required.

**Response `200`:**
```json
{ "status": "ok", "timestamp": "2024-01-15T10:00:00.000Z" }
```

---

## Error Responses

All error responses follow this consistent format:

```json
{ "error": "Human-readable error message" }
```

| Status Code | Meaning |
|-------------|---------|
| `400` | Bad Request — missing or invalid fields |
| `401` | Unauthorized — missing or expired token |
| `403` | Forbidden — token valid but access denied |
| `404` | Not Found — resource doesn't exist |
| `429` | Too Many Requests — rate limit hit (auth endpoints: 15 req / 15 min) |
| `500` | Internal Server Error — something went wrong on the server |

---

## Rate Limiting

Auth endpoints (`/api/auth/login`, `/api/auth/register`) are rate-limited to **15 requests per 15 minutes** per IP to prevent brute-force attacks.
