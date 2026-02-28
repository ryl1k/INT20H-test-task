# Architecture Overview

## What Is This Project

**Instant Wellness Kits** is an order management dashboard for wellness kit deliveries across New York State. The application provides:

- **Order Management** — Create, list, filter, sort, and export orders
- **NY Tax Calculation** — Automatic tax computation using 62 jurisdiction bounding boxes (state, county, city, special district rates)
- **Delivery Tracking** — Interactive Leaflet map with clustered markers showing delivery locations
- **CSV Import** — Bulk import orders via a 4-step wizard with Zod validation

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19.1 | UI framework |
| TypeScript | 5.9 | Type-safe JavaScript |
| Vite | 7.1 | Build tool and dev server |
| Tailwind CSS | 4.2 | Utility-first CSS framework |
| Zustand | 5.0 | Lightweight state management |
| Axios | 1.13 | HTTP client |
| Zod | 4.1 | Schema validation |
| Leaflet | 1.9 | Interactive maps |
| react-leaflet | 5.0 | React bindings for Leaflet |
| react-leaflet-cluster | 4.0 | Marker clustering |
| TanStack React Table | 8.21 | Headless table utilities |
| i18next | 25.6 | Internationalization (7 languages) |
| react-i18next | 15.7 | React bindings for i18next |
| react-router-dom | 7.13 | Client-side routing |
| clsx | 2.1 | Conditional class names |
| Vitest | 3.2 | Unit testing framework |
| Testing Library | 16.3 | React component testing |
| ESLint | 8.57 | Linting |
| Husky | 8.0 | Git hooks |

---

## Project Directory Structure

```
src/
├── api/                    # HTTP client and API functions
│   ├── axiosInstance.ts    # Axios config, interceptors, mock mode detection
│   ├── ordersApi.ts        # API functions (getOrders, createOrder, importCSV, getAllOrders, clearAllOrders)
│   └── ordersApi.test.ts
├── components/
│   ├── layout/             # App shell components
│   │   ├── AppLayout.tsx   # Root layout with sidebar, mobile header, toast container
│   │   ├── Sidebar.tsx     # Navigation sidebar (responsive, collapsible)
│   │   ├── LanguageSwitch.tsx  # Language dropdown (7 languages)
│   │   └── ThemeToggle.tsx # Dark/light mode toggle
│   ├── map/                # Leaflet map components
│   │   ├── MapContainer.tsx    # Leaflet wrapper with NY bounds
│   │   ├── LocationPicker.tsx  # Click-to-place marker with drag support
│   │   └── TaxZones.tsx        # Tax zone rectangles with rate-based coloring
│   ├── orders/             # Order-specific components
│   │   ├── OrdersTable.tsx     # TanStack-powered sortable, expandable table
│   │   ├── OrderFilters.tsx    # Debounced search, date/amount range filters
│   │   ├── CreateOrderForm.tsx # Zod-validated order creation form
│   │   ├── CreateOrderModal.tsx# Modal with embedded map + form
│   │   ├── TaxBreakdown.tsx    # SVG donut chart + jurisdiction badges
│   │   └── ImportPreview.tsx   # Validation results table for CSV import
│   ├── seo/
│   │   └── Seo.tsx         # Dynamic <title> and meta tags
│   └── ui/                 # Reusable UI primitives
│       ├── Button.tsx      # 4 variants, 3 sizes
│       ├── Card.tsx        # Bordered container with optional padding
│       ├── StatCard.tsx    # Animated count-up stat display
│       ├── Badge.tsx       # 5 color variants
│       ├── Modal.tsx       # Portal-based, focus-trapped dialog
│       ├── Toast.tsx       # Auto-dismiss notification system
│       ├── Spinner.tsx     # Loading indicator (3 sizes)
│       ├── EmptyState.tsx  # Placeholder with icon, title, action
│       ├── Input.tsx       # Form input with label and error
│       ├── Select.tsx      # Styled native select with label
│       ├── Pagination.tsx  # Page navigation with per-page selector
│       └── FileDropzone.tsx# Drag-and-drop file upload area
├── constants/
│   └── geo.ts              # NY geographic bounds, center, isInNY helper
├── hooks/
│   ├── useOrders.ts        # Fetch orders + store bridge
│   ├── useFileUpload.ts    # CSV parse + Zod validate
│   └── useDebounce.ts      # Generic debounce hook
├── i18n/
│   ├── config.ts           # i18next initialization (7 languages)
│   └── locales/            # Translation JSON files (en, uk, pl, es, it, fr, de)
├── mocks/
│   ├── mockApi.ts          # In-memory CRUD with simulated delays
│   ├── mockOrders.ts       # 200 seed orders with tax calculation
│   ├── taxRates.ts         # 62 NY jurisdictions, bounding-box lookup, calculateTax
│   ├── mockApi.test.ts
│   └── taxRates.test.ts
├── pages/
│   ├── SignInPage.tsx      # Mock sign-in with dev credential hint
│   ├── DashboardPage.tsx   # Stats, map, recent orders
│   ├── OrdersPage.tsx      # Paginated table + filters + CSV export
│   ├── ImportPage.tsx       # 4-step CSV import wizard + clear all orders
│   └── NotFoundPage.tsx    # 404 page
├── router/
│   ├── index.tsx           # createBrowserRouter configuration
│   ├── ProtectedRoute.tsx  # Auth guard (redirects to /sign-in)
│   └── routes.ts           # Route path constants
├── store/
│   ├── useAuthStore.ts     # Auth state (mock sign-in, session persistence)
│   ├── useOrderStore.ts    # Order state (orders, filters, pagination, loading)
│   ├── useUiStore.ts       # UI state (sidebar, toasts)
│   ├── useOrderStore.test.ts
│   └── useUiStore.test.ts
├── test/
│   └── setup.ts            # Vitest setup file
├── types/
│   └── order.ts            # TypeScript interfaces (Order, TaxBreakdown, etc.)
├── utils/
│   ├── cn.ts               # clsx wrapper for class merging
│   ├── csvParser.ts        # CSV text → row objects
│   ├── formatCurrency.ts   # Intl.NumberFormat USD formatter
│   ├── formatDate.ts       # Intl.DateTimeFormat formatter
│   ├── formatPercent.ts    # Rate → percentage string
│   └── *.test.ts           # Unit tests for each utility
├── validation/
│   ├── orderSchema.ts      # createOrderSchema (NY bounds + subtotal range)
│   ├── csvSchema.ts        # csvRowSchema (coerced types)
│   ├── orderSchema.test.ts
│   └── csvSchema.test.ts
├── index.css               # Design tokens, CSS variables, animations, map styles
└── main.tsx                # App entry point
```

---

## Data Flow

```
User Action
    │
    ▼
Page Component (DashboardPage, OrdersPage, ImportPage)
    │
    ▼
Custom Hook (useOrders, useFileUpload)
    │
    ▼
API Function (ordersApi.ts)
    │
    ├── isMockMode === true ──▶ mockApi.ts (in-memory store, simulated delay)
    │
    └── isMockMode === false ──▶ Axios → Real Backend API
    │
    ▼
Zustand Store (useOrderStore / useUiStore)
    │
    ▼
React Re-render (components subscribe to store slices)
```

### Request Lifecycle

1. **Page mounts** — triggers `useOrders()` or direct API call via `useEffect`
2. **Hook calls API function** — e.g., `getOrders(page, perPage, filters)`
3. **API function checks `isMockMode`** — routes to `mockApi` or real Axios call
4. **Response updates Zustand store** — `setOrders(data, meta)` or `setAllOrders(data)`
5. **Components re-render** — subscribed via `useOrderStore()` selectors

---

## State Management

### useAuthStore (`src/store/useAuthStore.ts`)

| State | Type | Description |
|---|---|---|
| `isAuthenticated` | `boolean` | Whether user is signed in (persisted in `sessionStorage`) |

| Action | Description |
|---|---|
| `signIn(email, password)` | Validates against mock credentials, sets session. Returns `true` on success |
| `signOut()` | Clears session and resets state |

**Mock credentials**: `admin@wellness.com` / `admin123`. Session persists across page reloads via `sessionStorage("auth_session")` but clears when the browser tab is closed.

### useOrderStore (`src/store/useOrderStore.ts`)

| State | Type | Description |
|---|---|---|
| `orders` | `Order[]` | Current page of paginated orders |
| `allOrders` | `Order[]` | All orders (for dashboard map/stats) |
| `meta` | `PaginatedMeta` | Pagination metadata (`page`, `perPage`, `total`, `totalPages`) |
| `filters` | `OrderFilters` | Active filter/sort state |
| `loading` | `boolean` | Request in-flight flag |
| `error` | `string \| null` | Error message |

| Action | Description |
|---|---|
| `setOrders(orders, meta)` | Replace paginated order list |
| `setAllOrders(orders)` | Replace all orders (dashboard) |
| `setFilters(partial)` | Merge partial filter updates |
| `resetFilters()` | Reset to defaults (`sortBy: "created_at"`, `sortDir: "desc"`) |
| `setLoading(bool)` | Set loading state |
| `setError(msg)` | Set error message |
| `addOrders(orders)` | Append new orders to `allOrders` and increment `meta.total` |
| `clearOrders()` | Reset orders, allOrders, and meta to defaults |

### useUiStore (`src/store/useUiStore.ts`)

| State | Type | Description |
|---|---|---|
| `sidebarOpen` | `boolean` | Sidebar visibility (default: open on `>= 1024px`) |
| `sidebarCollapsed` | `boolean` | Desktop sidebar collapsed to icon-only mode (default: `false`) |
| `toasts` | `Toast[]` | Active toast notifications |

| Action | Description |
|---|---|
| `toggleSidebar()` | Toggle sidebar open/closed (mobile) |
| `setSidebarOpen(bool)` | Set sidebar state directly |
| `toggleSidebarCollapsed()` | Toggle desktop sidebar between expanded and icon-only |
| `addToast({ type, message })` | Add toast with auto-generated UUID |
| `removeToast(id)` | Remove toast by ID |

---

## Routing

Defined in `src/router/index.tsx` using `createBrowserRouter`. The sign-in page sits outside the layout; all other routes are wrapped by `ProtectedRoute` → `AppLayout`:

| Route | Page Component | Guard | Description |
|---|---|---|---|
| `/sign-in` | `SignInPage` | None | Mock sign-in form |
| `/` | `DashboardPage` | `ProtectedRoute` | Stats, map, recent orders |
| `/orders` | `OrdersPage` | `ProtectedRoute` | Paginated table with filters |
| `/import` | `ImportPage` | `ProtectedRoute` | CSV import wizard |
| `*` | `NotFoundPage` | `ProtectedRoute` | 404 catch-all |

Route constants are defined in `src/router/routes.ts`:

```ts
export const ROUTES = {
  SIGN_IN: "/sign-in",
  DASHBOARD: "/",
  ORDERS: "/orders",
  IMPORT: "/import",
  CREATE: "/create"   // unused — page removed, create order available via modal on Orders page
} as const;
```

### Authentication Guard

**File**: `src/router/ProtectedRoute.tsx`

`ProtectedRoute` reads `useAuthStore.isAuthenticated`. If `false`, it renders `<Navigate to="/sign-in" replace />`; otherwise it renders `<Outlet />` to pass through to child routes.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | (none) | API base URL. Set to `"mock"` or leave empty for mock mode |
| `VITE_API_KEY` | (none) | API key sent via x-api-key header. Required when connecting to a real backend |

**Mock mode** is active when `VITE_API_BASE_URL` is empty or `"mock"`. In mock mode, all API calls route to `src/mocks/mockApi.ts` which uses an in-memory store of 200 seed orders.

`.env.example`:
```
VITE_API_BASE_URL=http://localhost:8080/v1
VITE_API_KEY=
```

---

## Build & Deployment

### npm Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `vite` | Start dev server |
| `build` | `tsc --noEmit && vite build` | Type-check and build for production |
| `preview` | `vite preview` | Preview production build locally |
| `lint` | `eslint . --ext .ts,.tsx --max-warnings=0` | Lint with zero warnings |
| `typecheck` | `tsc --noEmit` | TypeScript type checking |
| `test` | `vitest` | Run tests in watch mode |
| `test:run` | `vitest run --coverage` | Run tests once with coverage |
| `precommit` | `lint-staged && npm run typecheck` | Pre-commit hook checks |
| `precommit:check` | `npm run lint && npm run typecheck && npm run test:run` | Full pre-commit verification |
| `ci:check` | `npm run precommit:check && npm run build && npm run check:stack` | Full CI pipeline |

### Docker

Multi-stage build (`Dockerfile`):
1. **deps** — Install dependencies
2. **build** — Run `npm run build`
3. **runner** — Serve static `dist/` with `serve@14.2.1` on port 3000

### Vercel

`vercel.json` configures:
- Framework: `vite`
- Build command: `npm run build`
- Output: `dist/`
- SPA fallback: All routes rewrite to `/`

---

## Testing Strategy

- **Framework**: Vitest 3.2 with jsdom environment
- **Setup**: `src/test/setup.ts`
- **Coverage provider**: V8 with `text` and `lcov` reporters

### Coverage Thresholds

| Metric | Threshold |
|---|---|
| Lines | 70% |
| Functions | 70% |
| Branches | 65% |
| Statements | 70% |

### Existing Test Files

| File | Tests |
|---|---|
| `src/store/useOrderStore.test.ts` | Order store actions |
| `src/store/useUiStore.test.ts` | UI store actions |
| `src/validation/orderSchema.test.ts` | Order schema validation |
| `src/validation/csvSchema.test.ts` | CSV schema validation |
| `src/mocks/taxRates.test.ts` | Tax calculation + jurisdiction lookup |
| `src/mocks/mockApi.test.ts` | Mock API CRUD operations |
| `src/api/ordersApi.test.ts` | API function routing |
| `src/utils/formatCurrency.test.ts` | Currency formatting |
| `src/utils/formatPercent.test.ts` | Percent formatting |
| `src/utils/formatDate.test.ts` | Date formatting |
| `src/utils/csvParser.test.ts` | CSV parsing |
| `src/utils/cn.test.ts` | Class name merging |
| `src/i18n/config.test.ts` | i18n initialization |

### Coverage Exclusions

Components, pages, router, hooks, and types are excluded from coverage thresholds (UI integration testing is separate from unit coverage).

---

## Path Aliases

Configured in `vite.config.ts`:

```ts
resolve: { alias: { "@": "/src" } }
```

All imports use `@/` prefix to reference `src/`:
```ts
import { Button } from "@/components/ui/Button";
import { useOrderStore } from "@/store/useOrderStore";
```

---

## Error Handling Patterns

### Axios Interceptor Normalization

The Axios response interceptor in `src/api/axiosInstance.ts` catches all HTTP errors and normalizes them into standard `Error` objects. It extracts `error.response.data.message` when available, falling back to `error.message`. This ensures that all API errors surface as plain error messages regardless of backend response format.

### Toast Deduplication (`prevErrorRef`)

`OrdersPage.tsx` uses a `useRef<string | null>` to track the previous error message. The `useEffect` watching `error` only fires a toast when the error is new (differs from `prevErrorRef.current`). When the error clears, the ref resets to `null`. This prevents duplicate toasts when React re-renders or when the same error persists across renders.

```ts
const prevErrorRef = useRef<string | null>(null);
useEffect(() => {
  if (error && error !== prevErrorRef.current) {
    prevErrorRef.current = error;
    addToast({ type: "error", message: t("toast.ordersError") });
  } else if (!error) {
    prevErrorRef.current = null;
  }
}, [error, addToast, t]);
```

### StrictMode Double-Fetch Prevention

Two guards prevent React StrictMode from causing duplicate API requests in development:

**`useOrders.ts` — `mountedRef` + `ignore` flag**:
A `mountedRef` distinguishes initial mount from filter-driven re-fetches. On initial mount, an `ignore` flag is used inside the async IIFE so that the cleanup function from StrictMode's second mount can cancel the stale first request. On subsequent renders (filter changes), `mountedRef.current` is already `true`, so `fetchOrders()` is called directly without the ignore pattern.

```ts
const mountedRef = useRef(false);
useEffect(() => {
  if (mountedRef.current) {
    void fetchOrders();
    return;
  }
  let ignore = false;
  (async () => {
    // ... fetch logic, guarded by `if (!ignore)`
  })();
  mountedRef.current = true;
  return () => { ignore = true; };
}, [fetchOrders]);
```

**`DashboardPage.tsx` — `fetchedRef`**:
A `fetchedRef` ensures `fetchAll()` runs only once on mount, even when StrictMode double-invokes the effect. The ref flips to `true` before the async call, so the second invocation skips the fetch entirely.

```ts
const fetchedRef = useRef(false);
useEffect(() => {
  if (allOrders.length === 0 && !fetchedRef.current) {
    fetchedRef.current = true;
    void fetchAll();
  }
}, []);
```

### Import Step Revert on Failure

In `ImportPage.tsx`, if the import API call fails during step 3 ("importing"), the catch block reverts the wizard step back to "preview" and shows an error toast. This lets the user retry the import without re-uploading the file.

---

## CSV Export

### Inline `exportCsv()` in OrdersPage

**File**: `src/pages/OrdersPage.tsx`

The export functionality is implemented as an inline function within OrdersPage (not a shared utility). It supports two modes via the export modal:
- **Current page**: Exports only the orders currently displayed
- **All pages**: Fetches all orders via `getAllOrders()` before exporting

**CSV format**:
```
id,latitude,longitude,tax_rate,tax_amount,total,jurisdictions,status,reporting_code,created_at
```

Key details:
- **Jurisdictions** are joined with a **semicolon** separator (`o.jurisdictions.join(";")`) to avoid conflicts with the CSV comma delimiter
- Creates a `Blob` with `text/csv;charset=utf-8` MIME type
- Generates a download via `URL.createObjectURL()` → temporary `<a>` element → programmatic click → `URL.revokeObjectURL()` cleanup
- Filename: `orders-export.csv`
- Shows a warning toast if no orders are available, or a success toast with the exported count

---

## App Entry Point

**File**: `src/main.tsx`

```ts
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./i18n/config";   // Side-effect: initializes i18next
import "./index.css";      // Side-effect: loads global CSS and design tokens

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

- **`React.StrictMode`**: Enabled, which causes components to double-render in development mode (helps catch side-effect bugs). No impact in production builds.
- **Side-effect imports**: `./i18n/config` initializes i18next with all language resources; `./index.css` loads design tokens, CSS custom properties, animations, and Leaflet overrides.
