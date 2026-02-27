<p align="center">
  <img src="public/logo-no-bg.png" alt="Instant Wellness Kits" width="80" />
</p>

<h1 align="center">Instant Wellness Kits</h1>

<p align="center">Order management dashboard for wellness kit deliveries across New York State.</p>

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 19, TypeScript 5, Vite 7 |
| Styling | Tailwind CSS 4 |
| State | Zustand 5 |
| Routing | React Router 7 |
| Data Table | TanStack Table 8 |
| Maps | Leaflet + react-leaflet + react-leaflet-cluster |
| Forms / Validation | Zod 4 |
| HTTP | Axios |
| i18n | i18next (7 languages: EN, UK, DE, ES, FR, IT, PL) |
| Testing | Vitest + Testing Library + jsdom |
| Linting | ESLint + Husky + lint-staged |

## Getting Started

```bash
# Install dependencies
npm install

# Copy env and fill in values
cp .env.example .env

# Start dev server
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL (e.g. `http://localhost:8080/v1`) |
| `VITE_API_KEY` | API key sent via `x-api-key` header on every request |

When both are empty the app runs in **mock mode** with client-side data generation.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint (zero warnings policy) |
| `npm run typecheck` | TypeScript type-check only |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once with coverage |
| `npm run ci:check` | Full CI pipeline (lint + typecheck + test + build + stack verify) |

## Project Structure

```
src/
├── api/                  # Axios instance & API functions
│   ├── axiosInstance.ts   # Axios setup, interceptors, mock mode detection
│   └── ordersApi.ts       # CRUD: getOrders, createOrder, importCSV, getAllOrders, clearAllOrders
├── components/
│   ├── layout/            # AppLayout, Sidebar, ThemeToggle, LanguageSwitch
│   ├── map/               # MapContainer (clustered markers), LocationPicker
│   ├── orders/            # OrdersTable, OrderFilters, TaxBreakdown, ImportPreview,
│   │                        CreateOrderForm, CreateOrderModal
│   ├── seo/               # <Seo> component (document head)
│   └── ui/                # Badge, Button, Card, EmptyState, FileDropzone, Input,
│                            Modal, Pagination, Select, Spinner, StatCard, Toast
├── constants/             # geo.ts (NY State bounds, default coords)
├── hooks/                 # useDebounce, useFileUpload, useOrders
├── i18n/                  # i18next config + 7 locale JSON files
├── mocks/                 # Mock API, mock order generator, mock tax rates
├── pages/                 # Route-level page components (see Pages below)
├── router/                # Route definitions, ProtectedRoute guard
├── store/                 # Zustand stores (useAuthStore, useOrderStore, useUiStore)
├── types/                 # Order, TaxBreakdown, OrderFilters, PaginatedResponse
├── utils/                 # cn, csvParser, formatCurrency, formatDate, formatPercent
└── validation/            # Zod schemas for CSV rows & order creation
```

## Pages

| Route | Page | Description |
|---|---|---|
| `/sign-in` | SignInPage | Email/password authentication |
| `/` | DashboardPage | Stats cards, recent orders table, interactive delivery map with clustered markers |
| `/orders` | OrdersPage | Paginated orders table with filters, sorting, expandable tax breakdown, CSV export, create order modal |
| `/import` | ImportPage | CSV upload with drag-and-drop, preview/validation, bulk import, clear all orders with confirmation modal |
| `/create` | CreateOrderPage | Interactive map location picker + order creation form |
| `*` | NotFoundPage | 404 fallback |

## Features

### Dashboard
- Four stat cards (total orders, revenue, tax collected, average tax rate) with loading spinners
- Recent orders table with date, jurisdictions, tax, and total columns
- Interactive Leaflet map with marker clustering (configurable: 300 / 500 / 1,000 / 5,000 / all)
- Dashboard data cached in Zustand store across page navigations

### Orders
- Server-side paginated table with configurable page sizes
- Filters: date range, amount range, status, reporting code
- Sortable columns (ID, date, total amount)
- Expandable rows with interactive donut chart tax breakdown
- Export to CSV (current page or all pages)
- Create order modal with map-based location picker

### Import CSV
- Drag-and-drop file upload with `.csv` validation
- Client-side CSV parsing and row validation via Zod schemas
- Preview table showing valid/invalid rows before import
- Bulk import to backend (`POST /orders/import`)
- Clear all orders button with confirmation modal (`DELETE /orders`)

### Create Order
- Full-page interactive map (click to set delivery coordinates)
- Form with latitude, longitude, subtotal fields
- Server-side tax calculation on submit

### General
- Dark/light theme toggle with CSS custom properties
- 7-language i18n support with language switcher
- Protected routes with auth guard
- Toast notification system
- Responsive sidebar layout
- SEO meta tags per page
- Mock mode for offline/demo usage

## API Integration

The frontend communicates with a Go/Echo backend. Key endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/v1/orders` | Paginated list with filters |
| `GET` | `/v1/orders/:id` | Single order details |
| `POST` | `/v1/orders` | Create single order (JSON body) |
| `POST` | `/v1/orders/import` | Bulk import (multipart CSV upload) |
| `DELETE` | `/v1/orders` | Delete all orders |
| `GET` | `/v1/health` | Health check |

All requests include `x-api-key` header. The backend response envelope is `{ data: { orders, total } }` for list endpoints and `{ data: Order }` for single resources.

## Mock Mode

When `VITE_API_BASE_URL` is empty, the app runs entirely client-side:
- Orders generated from `mockOrders.ts` with realistic NY State coordinates
- Tax rates calculated from embedded `taxRates.ts` lookup table
- All CRUD operations simulated in-memory via `mockApi.ts`

## Deployment

- **`main`** branch: quality checks, Docker publish to GHCR, deploy to Heroku
- **`develop`** branch: quality checks only
- **Pull requests**: quality checks + Docker build validation

### Required Secrets

`HEROKU_API_KEY` | `HEROKU_APP_NAME`
