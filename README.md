<table>
<tr>
<td>

# INT20H Tax Orders Platform

**A full-stack system for tax-aware order processing in New York State.**

Built for hackathon delivery: upload or create orders, calculate jurisdiction taxes, review analytics, and manage data through a modern dashboard.

[![Go](https://img.shields.io/badge/Go-1.25-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://go.dev)
[![Echo](https://img.shields.io/badge/Echo-v4-000000?style=for-the-badge)](https://echo.labstack.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)

</td>
<td width="200">
<img src="client/public/logo-no-bg.png" alt="Project Logo" width="180" />
</td>
</tr>




</table>

<h2 align="center">Our Team</h2>

<table align="center">
  <tr>
    <td align="center" width="170">
      <a href="https://github.com/Megidy">
        <img src="https://avatars.githubusercontent.com/u/176305373?v=4" width="100px;" alt="Serhii Burka" />
        <br />
        <sub><b>Serhii Burka</b></sub>
      </a>
      <br />
      Backend
    </td>
    <td align="center" width="170">
      <a href="https://github.com/ryl1k">
        <img src="https://avatars.githubusercontent.com/u/146999658?v=4" width="100px;" alt="Ruslan Shevchuk" />
        <br />
        <sub><b>Ruslan Shevchuk</b></sub>
      </a>
      <br />
      DevOps, Team Lead
    </td>
    <td align="center" width="170">
      <a href="https://github.com/mineo71">
        <img src="https://avatars.githubusercontent.com/u/23060147?v=4" width="100px;" alt="Oleh Rylsky" />
        <br />
        <sub><b>Oleh Rylsky</b></sub>
      </a>
      <br />
      Frontend, UI/UX
    </td>
    <td align="center" width="170">
      <a href="https://github.com/sod7m">
        <img src="https://avatars.githubusercontent.com/u/115317048?v=4" width="100px;" alt="Dmytro Dyshlevenko" />
        <br />
        <sub><b>Dmytro Dyshlevenko</b></sub>
      </a>
      <br />
      Frontend, SEO
    </td>
  </tr>
</table>

---

## What Is This Project?

This repository is a monorepo with:

- `server/` - Go + Echo API for order creation, CSV import, tax breakdown, pagination, and filtering.
- `client/` - React dashboard with tables, map, filters, import flow, and multilingual UI.

The primary use case is fast operations for location-based order taxation.

---

## Core Features

**Order Creation API** - Create orders by coordinates and subtotal, then compute status, reporting code, and full tax breakdown.

**Batch CSV Import** - Upload orders in bulk via `POST /v1/orders/import` and process asynchronously.

**Tax Intelligence** - Resolve jurisdictions and composite rates using embedded `jurisdictions.json` and `counties.geojson`.

**Order Management UI** - View, filter, paginate, sort, and inspect tax details from a modern frontend.

**Health + Docs** - Built-in health endpoint and Swagger UI with API key authentication.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Go, Echo, pgx, zerolog |
| Frontend | React, TypeScript, Vite, Zustand, Axios |
| Data | PostgreSQL 16 |
| API Docs | Swaggo / Swagger UI |
| Infra | Docker, Docker Compose, Heroku (container deploy) |
| Testing | Go test, Vitest |

---

## Architecture

```text
.
├── client/                    # Frontend app
├── server/                    # Backend app
│   ├── cmd/api                # API entrypoint
│   ├── internal/controller    # HTTP layer
│   ├── internal/usecase       # Business logic
│   ├── internal/repo          # Persistence + tax repos
│   ├── migrations             # DB schema
│   └── docs                   # Swagger + CI/CD docs
├── docker-compose.yml         # Full local stack
└── scripts/start-all.*        # One-command startup scripts
```

Runtime flow:

```text
Client (React) --> API (/v1, x-api-key) --> UseCase --> Postgres
                                 |
                                 --> GeoJSON + jurisdictions tax config
```

---

## Quick Start

### Note

For quick testing, you can go to already deployed services:
- API on [Heroku](https://int20h-test-task-server-eu-411f1ef7d693.herokuapp.com/swagger/index.html)
- Frontend on [Vercel](https://int20h-chillin.vercel.app)

### Credentials

For auth use:
- user ```admin@wellness.com```
- password ```admin123```

### Prerequisites

- Docker Desktop (or Docker Engine + Compose v2)
- Git

### Start Everything

From repository root:

```bash
# Linux/macOS
./scripts/start-all.sh
```

```powershell
# Windows
.\scripts\start-all.ps1
```

If `.env` is missing, scripts auto-create it from `.env.example`.

### Open Services

- Frontend: `http://localhost:3000`
- Backend health: `http://localhost:8080/v1/health`
- Swagger: `http://localhost:8080/swagger/index.html`

Default local API key:

- `hackathon-dev-key`

---

## API Endpoints

Base path: `/v1` (requires `x-api-key`).

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/v1/health` | Service health |
| `GET` | `/v1/orders` | List orders with filters/pagination |
| `GET` | `/v1/orders/:id` | Fetch one order |
| `POST` | `/v1/orders` | Create one order |
| `POST` | `/v1/orders/import` | Import CSV batch |
| `DELETE` | `/v1/orders` | Delete all orders |

Quick check:

```bash
curl -H "x-api-key: hackathon-dev-key" http://localhost:8080/v1/health
```

---

## Environment

Main template: [`.env.example`](.env.example)

Important variables:

- `API_KEY` - required by backend middleware
- `VITE_API_KEY` - sent by frontend, must match `API_KEY`
- `VITE_API_BASE_URL` - defaults to `http://localhost:8080/v1`
- `POSTGRES_CONNECTION_URI` - compose default points to `postgres` service

Backend required envs are defined in:

- [`server/internal/config/config.go`](server/internal/config/config.go)

---

## Useful Commands

```bash
# Build and run stack in background
docker compose up --build -d

# Follow all logs
docker compose logs -f

# Stop services
docker compose down

# Full reset with DB volume removal
docker compose down -v
```

Script options:

- `./scripts/start-all.sh --no-build`
- `./scripts/start-all.sh --foreground`
- `.\scripts\start-all.ps1 -NoBuild`
- `.\scripts\start-all.ps1 -Foreground`

---

## Documentation Index

Backend docs:

- [server/README.md](server/README.md)
- [server/docs/ci-cd.md](server/docs/ci-cd.md)

Frontend docs:

- [client/README.md](client/README.md)
- [client/docs/01-architecture.md](client/docs/01-architecture.md)
- [client/docs/02-components.md](client/docs/02-components.md)
- [client/docs/03-pages-and-features.md](client/docs/03-pages-and-features.md)
- [client/docs/04-api-and-data.md](client/docs/04-api-and-data.md)
- [client/docs/05-design-specs.md](client/docs/05-design-specs.md)

---

## Troubleshooting

### Swagger "NetworkError when attempting to fetch resource"

- Use local Swagger URL: `http://localhost:8080/swagger/index.html`
- Click **Authorize** and provide API key value
- Verify backend container is healthy

### CSV upload returns "unsupported file format"

- Use form field name `orders`
- Ensure file extension is `.csv`

### `401 Unauthorized`

- Ensure `API_KEY` and `VITE_API_KEY` are identical in `.env`
- Rebuild client after env updates

---

## Deployment Note

Repository includes Heroku container deploy assets:

- root `heroku.yml`
- `server/Dockerfile.heroku`

Local evaluation can be done entirely via Docker Compose without Heroku.
