# Rupee Ledger – Personal Expense Tracker (React + Spring Boot + MongoDB)

**Database:** MongoDB, database `expense_tracker`, collections `users` and `expenses` (each expense stores the `userId` of its owner).

## Setup
Prerequisites: Java 17+, Maven, Node 18+, MongoDB (local Community Server on port 27017, or a free MongoDB Atlas cluster).

1. **Start MongoDB** (on Windows it normally runs as a service named "MongoDB"; check with `mongosh`).
   Using Atlas instead? Put your `mongodb+srv://...` string in `backend/src/main/resources/application.properties` (`spring.data.mongodb.uri`).
2. **Backend** (port 8081): `cd backend` then `mvn spring-boot:run`
3. **Frontend**: `cd frontend` then `npm install` then `npm run dev` and open http://localhost:5173
   (If you change `server.port`, change the proxy target in `frontend/vite.config.js` too.)

## How it works
- `#/` public landing page → "Open dashboard" → `#/login` / `#/register` → `#/dashboard`
- Passwords are hashed with BCrypt. Login returns a random token (valid 7 days) stored on the user document; the frontend sends it as `Authorization: Bearer <token>`.
- Every expense endpoint reads the logged-in user from that token, so users only ever see their own expenses.

## REST API
| Method | URL | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | no | `{name,email,password}` → `{token,user}` (409 if email exists) |
| POST | `/api/auth/login` | no | `{email,password}` → `{token,user}` (401 if wrong) |
| GET | `/api/auth/me` | yes | Current user |
| POST | `/api/auth/logout` | yes | Invalidate token |
| GET | `/api/expenses[?category=Food]` | yes | List (newest first), optional filter |
| GET | `/api/expenses/summary` | yes | Total, count, per-category totals |
| POST | `/api/expenses` | yes | Add |
| PUT | `/api/expenses/{id}` | yes | Update |
| DELETE | `/api/expenses/{id}` | yes | Delete (204) |

Expense body: `{"title":"Lunch","amount":250.50,"category":"Food","date":"2026-10-18"}`
Validation errors → HTTP 400 `{message, errors:{field:msg}}`; no/expired token → 401; MongoDB down → 503.

## Viva notes
- Why BCrypt (one-way salted hash) instead of storing passwords.
- Why `@Document` / `MongoRepository` instead of JPA; `@Indexed(unique=true)` on email.
- Why the interceptor: one place that authenticates every protected request.
- `@JsonIgnore` on `Expense.userId` so a client can't set or read the owner field.
