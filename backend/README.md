# English Premier League Backend

This is a Go (Golang) backend using Gin and GORM (PostgreSQL) implementation for the EPL frontend.

## Structure
- `cmd/server`: Entry point (`main.go`)
- `internal/config`: Environment configuration
- `internal/models`: Database models (User, Team, Match, etc.)
- `internal/handlers`: HTTP API Controllers
- `internal/services`: Business logic
- `internal/repositories`: Database access layer
- `internal/routes`: API Route definitions
- `internal/middleware`: Auth and CORS

## Prerequisites
- Go 1.21+
- PostgreSQL
- `epl_db` database created in Postgres

## Setup
1. **Database**: Ensure PostgreSQL is running and you have created a database (default: `epl_db`).
2. **Environment**: Check `.env` file and update credentials if necessary.
   ```env
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=epl_db
   PORT=8080
   JWT_SECRET=your_secret
   ```
3. **Install Dependencies**:
   ```bash
   go mod tidy
   ```

## Running
```bash
go run cmd/server/main.go
```
The server will start on http://localhost:8080.

## API Endpoints
- **Auth**:
  - `POST /api/auth/register`: {email, password, fullName}
  - `POST /api/auth/login`: {email, password}
- **Public**:
  - `GET /api/matches`
  - `GET /api/standings`
  - `GET /api/teams`
  - `GET /api/teams/:id`
- **Protected** (Bearer Token required):
  - `POST /api/matches`: {homeTeamId, awayTeamId, date, ...}

## Connecting Frontend
To connect the existing frontend to this backend:
1. Update frontend to use `fetch` or `axios` instead of `localStorage`.
2. Map the API endpoints to the frontend services.
