# INT20H Test Task (Monorepo)

Full-stack order management system for wellness-kit deliveries in New York State:

- `client/`: React + TypeScript + Vite dashboard
- `server/`: Go + Echo API with Postgres

This repository is prepared for hackathon judging with a one-command Docker startup path.

## Quick Start (Judge Path)

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose v2)
- `git`

### Run Everything

From repository root:

```bash
# Linux/macOS
./scripts/start-all.sh
```

```powershell
# Windows PowerShell
.\scripts\start-all.ps1
```

The script will auto-create `.env` from `.env.example` on first run.

### Open

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:8080/v1/health`
- Swagger UI: `http://localhost:8080/swagger/index.html`

## What Starts

`docker-compose.yml` launches:

1. `postgres` (`postgres:16.1`) with persistent volume `postgres_data`
2. `server` (Go API, built from `server/Dockerfile.heroku`)
3. `client` (production static build served on port `3000`)

Database schema is initialized on first boot via:

- `server/migrations/dev/20260223192949_orders.up.sql`

## Environment Configuration

Main variables are documented in `.env.example`. Most important ones:

- `API_KEY` (backend required)
- `VITE_API_KEY` (frontend header, should match `API_KEY`)
- `VITE_API_BASE_URL` (defaults to `http://localhost:8080/v1`)
- `POSTGRES_CONNECTION_URI` (defaults to the compose `postgres` service)

Default local key:

- `hackathon-dev-key`

## API Quick Checks

Use the default key unless you changed `.env`:

```bash
curl -H "x-api-key: hackathon-dev-key" http://localhost:8080/v1/health
```

```bash
curl -H "x-api-key: hackathon-dev-key" "http://localhost:8080/v1/orders?page=1&pageSize=10"
```

## Useful Commands

```bash
# Rebuild and run in background
docker compose up --build -d

# Follow logs
docker compose logs -f

# Stop stack
docker compose down

# Stop and remove database data (full reset)
docker compose down -v
```

Script options:

- `scripts/start-all.sh --no-build`
- `scripts/start-all.sh --foreground`
- `.\scripts\start-all.ps1 -NoBuild`
- `.\scripts\start-all.ps1 -Foreground`

## Repository Map

```text
.
├── client/                 # Frontend app
├── server/                 # Backend API
├── docker-compose.yml      # Full local stack
├── .env.example            # Compose env template
└── scripts/
    ├── start-all.sh
    └── start-all.ps1
```

## Documentation Index

Detailed references:

- Backend overview: [server/README.md](server/README.md)
- Frontend overview: [client/README.md](client/README.md)
- Backend CI/CD: [server/docs/ci-cd.md](server/docs/ci-cd.md)
- Frontend architecture: [client/docs/01-architecture.md](client/docs/01-architecture.md)
- Frontend components: [client/docs/02-components.md](client/docs/02-components.md)
- Frontend pages/features: [client/docs/03-pages-and-features.md](client/docs/03-pages-and-features.md)
- Frontend API/data contracts: [client/docs/04-api-and-data.md](client/docs/04-api-and-data.md)
- Frontend design notes: [client/docs/05-design-specs.md](client/docs/05-design-specs.md)

## Troubleshooting

### `401 Unauthorized` from API

- Ensure `API_KEY` and `VITE_API_KEY` are the same value in `.env`.
- Rebuild client after changing frontend vars:
  - `docker compose up --build -d`

### Backend starts then crashes on config

- Verify required env vars in `.env` are set (or keep defaults from `.env.example`).
- Check logs: `docker compose logs server -f`

### Port already in use

- Change `CLIENT_PORT`, `SERVER_PORT`, or `POSTGRES_PORT` in `.env`.

### Dirty local DB state

- Reset containers and volume:
  - `docker compose down -v`
  - `docker compose up --build -d`

## Notes for Deployment

This monorepo includes Heroku container deployment config (`heroku.yml`) for backend deployment flow.
Local judge instructions above are independent of Heroku and require only Docker.
