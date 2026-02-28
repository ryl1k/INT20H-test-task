# Infrastructure & Tooling

Build tooling, CI/CD pipeline, Docker configuration, linting, TypeScript settings, and static assets.

---

## Prerequisites

- **Node.js**: `>=20.11.0` (enforced via `engines` field in `package.json`)
- **npm**: Ships with Node.js

---

## Vite Dev Proxy

**File**: `vite.config.ts`

The dev server proxies API requests to the Heroku-hosted backend:

```ts
server: {
  proxy: {
    "/v1": {
      target: "https://int20h-test-task-server-275358d60541.herokuapp.com",
      changeOrigin: true,
      secure: true
    }
  }
}
```

All requests to `/v1/*` in development are forwarded to the backend. This avoids CORS issues during local development and allows the frontend to use relative API paths.

---

## CI/CD Pipeline

**File**: `.github/workflows/frontend-ci-cd.yml`

### Trigger Conditions

- **Pull request** to `main` or `develop`
- **Push** to `main` or `develop`
- **Manual dispatch** (`workflow_dispatch`)

### Concurrency

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

In-progress runs for the same branch are cancelled when a new run starts.

### Job Chain

```
quality_gate ──┐
               ├──▶ docker_publish ──▶ deploy_heroku
docker_build_validation ──┘
```

#### 1. `quality_gate`

Runs on all triggers. Executes the full quality pipeline:

```bash
npm run ci:check  # lint + typecheck + test:run + build + check:stack
```

#### 2. `docker_build_validation`

Runs on all triggers. Builds the Docker image **without pushing** to validate the Dockerfile:

```bash
docker build --build-arg VITE_API_BASE_URL=... --build-arg VITE_API_KEY=... .
```

#### 3. `docker_publish`

Runs **only on push to `main`**. Requires `quality_gate` and `docker_build_validation` to pass.

- Logs into GitHub Container Registry (GHCR)
- Builds and pushes Docker image with three tags:
  - `latest`
  - `main`
  - `sha-{commit_sha}` (first 7 characters)

Image path: `ghcr.io/{owner}/{repo}:tag`

#### 4. `deploy_heroku`

Runs **only on push to `main`**. Requires `docker_publish` to pass.

- Pulls the published image from GHCR
- Re-tags it for Heroku's container registry
- Pushes to `registry.heroku.com/{app}/web`
- Releases via `heroku container:release web`

### Required Secrets

| Secret | Usage |
|---|---|
| `GITHUB_TOKEN` | GHCR authentication (auto-provided) |
| `HEROKU_API_KEY` | Heroku CLI authentication |
| `HEROKU_APP_NAME` | Target Heroku app name |
| `VITE_API_BASE_URL` | Backend API URL for production build |
| `VITE_API_KEY` | API key baked into production build |

---

## Docker

**File**: `Dockerfile`

Multi-stage build using `node:20-alpine`:

### Stage 1: `deps`
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install
```

### Stage 2: `build`
```dockerfile
FROM deps AS build
COPY . .
ARG VITE_API_BASE_URL=http://localhost:8080/v1
ARG VITE_API_KEY=hackathon-dev-key
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_API_KEY=${VITE_API_KEY}
RUN npm run build
```

Build args allow injecting environment variables at build time (Vite embeds them into the static bundle).

### Stage 3: `runner`
```dockerfile
FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3000
RUN npm install --global serve@14.2.1
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
```

Serves the static `dist/` directory with `serve@14.2.1` on port 3000. The `-s` flag enables SPA fallback (rewrites all routes to `index.html`).

### `.dockerignore`

Excludes from Docker build context: `.git`, `.github`, `.husky`, `.vercel`, `node_modules`, `dist`, `build`, `coverage`, `.vite`, `*.tsbuildinfo`, log files, `.env` files (except `.env.example`), IDE configs (`.vscode`, `.idea`), OS files (`.DS_Store`, `Thumbs.db`).

---

## Stack Verification

**File**: `scripts/verify-stack.mjs`

A validation script run as part of `npm run ci:check` (via the `check:stack` script). Verifies that the project has the required dependencies, scripts, and files.

### Checks Performed

| Category | Items Verified |
|---|---|
| **Packages** | react, react-dom, typescript, eslint, vite, husky, lint-staged, zustand, zod, i18next, react-i18next |
| **Scripts** | lint, typecheck, test:run, build, precommit, precommit:check, ci:check |
| **Files** | `vite.config.ts`, `src/main.tsx`, `src/store/useOrderStore.ts`, `src/validation/orderSchema.ts`, `src/i18n/config.ts`, `.husky/pre-commit` |
| **Script content** | Verifies `precommit` script includes `lint-staged` |

Exits with code 1 and a descriptive error if any check fails.

---

## ESLint Configuration

**File**: `.eslintrc.cjs`

### Extends

- `eslint:recommended`
- `plugin:@typescript-eslint/recommended-type-checked`
- `plugin:@typescript-eslint/stylistic-type-checked`
- `plugin:react-hooks/recommended`

### Key Rules

| Rule | Setting | Impact |
|---|---|---|
| `@typescript-eslint/no-floating-promises` | `"error"` | All promises must be handled (`await`, `.then()`, `.catch()`, or prefixed with `void`) |
| `react-refresh/only-export-components` | `"warn"` | Warns when non-component exports may break fast refresh |

### The `void` Pattern

The `no-floating-promises` rule is why you'll see `void someAsyncFunction()` throughout the codebase. The `void` operator explicitly marks a promise as intentionally unhandled (fire-and-forget), satisfying the linter without requiring `await` or `.catch()`.

### Zero-Warning Policy

The lint script runs with `--max-warnings=0`, meaning **any** warning fails the build. This enforces strict code quality in CI.

---

## TypeScript Configuration

**File**: `tsconfig.json`

### Key Compiler Options

| Option | Value | Impact |
|---|---|---|
| `strict` | `true` | Enables all strict type-checking options (strictNullChecks, noImplicitAny, etc.) |
| `noUncheckedIndexedAccess` | `true` | Array/object index access returns `T \| undefined`, requiring explicit type guards or `!` assertions |
| `noEmit` | `true` | TypeScript only type-checks; Vite handles transpilation |
| `isolatedModules` | `true` | Required for Vite's esbuild-based transpilation |
| `jsx` | `react-jsx` | Uses the automatic JSX runtime (no `import React` needed) |

### The `!` Assertion Pattern

Because `noUncheckedIndexedAccess` is enabled, indexed access like `array[0]` returns `T | undefined`. You'll see non-null assertions (`array[0]!`) in places where the code is confident the index exists (e.g., after a length check). This is a deliberate trade-off: the strictness catches real bugs at the cost of occasional explicit assertions.

### Path Aliases

```json
"paths": { "@/*": ["src/*"] }
```

Mirrored in `vite.config.ts` via `resolve.alias`.

### Global Types

The `tsconfig.json` includes type references that make test types globally available without explicit imports:
- `vitest/globals` — Vitest's `describe`, `it`, `expect`, etc.
- `@testing-library/jest-dom` — Custom DOM matchers like `toBeInTheDocument()`

---

## Test Setup

**File**: `src/test/setup.ts`

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "../i18n/config";

afterEach(() => {
  cleanup();
});
```

| Setup Step | Purpose |
|---|---|
| `@testing-library/jest-dom/vitest` | Registers custom DOM matchers (`toBeInTheDocument`, `toHaveTextContent`, etc.) for Vitest |
| `cleanup()` after each test | Unmounts React components and clears the DOM between tests |
| `../i18n/config` | Initializes i18next so translation keys resolve in component tests |

Referenced in `vitest.config` via `setupFiles: ["src/test/setup.ts"]`.

---

## External CDN Dependencies

**File**: `index.html`

### Google Fonts

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&display=swap" rel="stylesheet" />
```

Fonts are loaded from Google Fonts CDN with `preconnect` hints for faster loading. Three font families: IBM Plex Mono, IBM Plex Sans, Libre Baskerville.

### Leaflet CSS

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  crossorigin="" />
```

Leaflet CSS v1.9.4 loaded from unpkg CDN with **Subresource Integrity (SRI)** hash to prevent CDN tampering. The Leaflet JS library itself is bundled via npm (not loaded from CDN).

---

## Public Assets

**Directory**: `public/`

### `manifest.webmanifest`

Progressive Web App manifest:

```json
{
  "name": "Instant Wellness Kits",
  "short_name": "Wellness Kits",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#E8573D",
  "background_color": "#FDF8F6",
  "icons": [
    { "src": "/favicon.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/favicon.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### `robots.txt`

```
User-agent: *
Allow: /
Disallow: /api/
```

Allows crawling of all public pages, blocks the `/api/` path.

### `sitemap.xml`

Lists four URLs:
- `/` (Dashboard)
- `/orders` (Orders page)
- `/import` (Import page)
- `/create` (Create order page)

**Note**: The `/create` route is currently **commented out** in `src/router/index.tsx`, but remains in the sitemap. This should be updated if the route is permanently removed.

### Favicons & Logos

| File | Usage |
|---|---|
| `favicon.ico` | Browser tab icon (legacy format) |
| `favicon.png` | Modern browsers and PWA icon |
| `apple-touch-icon.png` | iOS home screen icon |
| `logo-no-bg.png` | App logo (transparent background), displayed in sidebar and mobile header |

### `index.html` Meta Tags

- `<meta name="theme-color" content="#E8573D">` — Browser chrome color (coral)
- `<link rel="manifest" href="/manifest.webmanifest">` — PWA manifest link
- Viewport: `width=device-width, initial-scale=1.0`

---

## `.gitignore`

Notable patterns:

| Pattern | Reason |
|---|---|
| `package-lock.json` | Not committed (npm lockfile excluded by project convention) |
| `node_modules/` | Dependencies |
| `dist/`, `build/` | Build outputs |
| `coverage/` | Test coverage reports |
| `.env`, `.env.local`, `.env.*.local` | Environment secrets (`.env.example` is tracked) |
| `.vite/`, `.cache/` | Build caches |
| `*.log` | Log files |
