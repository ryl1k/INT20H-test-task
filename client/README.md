<p align="center">
  <img src="public/logo-no-bg.png" alt="Instant Wellness Kits" width="80" />
</p>

<h1 align="center">Instant Wellness kits</h1>

<p align="center">Order management dashboard for wellness kit deliveries across New York State.</p>

---

## Tech Stack

React 19 | TypeScript | Vite | Tailwind CSS | Zustand | Leaflet | i18next (7 languages)

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check + production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test:run` | Run tests with coverage |
| `npm run ci:check` | Full CI pipeline |

## Deployment

- **`main`** branch: quality checks, Docker publish to GHCR, deploy to Heroku
- **`develop`** branch: quality checks only
- **Pull requests**: quality checks + Docker build validation

### Required Secrets

`HEROKU_API_KEY` | `HEROKU_APP_NAME`

Vercel deployment should be handled by Vercel's Git integration (automatic deployments), not GitHub Actions.
