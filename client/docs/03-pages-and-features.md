# Pages & Features

Each page described as a user-facing feature with data flow, components used, and behavior details.

---

## Sign In (`/sign-in`)

**File**: `src/pages/SignInPage.tsx`

Mock authentication page. All dashboard routes are protected behind this sign-in gate.

### Components Used

- `Seo` — Sets page title and description
- `Card` — Form container
- `Input` (x2) — Email and password fields
- `Button` — Submit button

### Layout

Centered on screen, max-width 384px (`max-w-sm`). Logo + app name header above the form card. Dev hint block below the form (visible only in development).

### Flow

1. User enters email and password
2. On submit, calls `useAuthStore.signIn(email, password)`
3. Validates against mock credentials (`admin@wellness.com` / `admin123`)
4. On success: navigates to Dashboard (`/`)
5. On failure: shows inline error message

### Dev Credentials Hint

In development mode (`import.meta.env.DEV === true`), a dashed-border hint block displays the mock email and password below the form. This block is **not rendered** in production builds.

### Authentication Persistence

Session is stored in `sessionStorage("auth_session")`. This means:
- Survives page reloads within the same tab
- Cleared when the browser tab/window is closed
- Each tab has its own session

### Sign Out

The sidebar footer includes a "Sign Out" button that opens a confirmation modal. On confirm, calls `useAuthStore.signOut()` and navigates to `/sign-in`.

---

## Dashboard (`/`)

**File**: `src/pages/DashboardPage.tsx`

The landing page providing an at-a-glance overview of all orders.

### Components Used

- `Seo` — Sets page title and description
- `StatCard` (x4) — Animated statistics
- `Card` — Container for map and recent orders
- `MapContainer` — Leaflet map wrapper
- `MarkerClusterGroup` — Clustered delivery markers
- `Marker` + `Popup` — Individual order markers with details
- `TaxZones` — Tax zone rectangles overlay (toggled via checkbox)
- `Select` — Native `<select>` for map page size
- `Spinner` — Map loading overlay and individual stat card loading indicators

### Data Flow

1. On mount, calls `getAllOrders()` directly (not via `useOrders` hook). A `fetchedRef` guard ensures the fetch runs only once even under React StrictMode double-invocation.
2. Stores result in `useOrderStore.allOrders` via `setAllOrders()`
3. Computes derived stats from `allOrders` in a single memoized pass (`useMemo` with `for...of` loop):
   - **Total Orders**: `allOrders.length`
   - **Total Revenue**: Sum of `total_amount`
   - **Total Tax**: Sum of `tax_amount`
   - **Average Tax Rate**: Mean of `composite_tax_rate`
   - Data is **cached** — if `allOrders` already has data in the Zustand store, the fetch is skipped on subsequent visits.
4. Progressive loading: StatCards show individual `Spinner` components via their `loading` prop while data is being fetched. Map shows a frosted spinner overlay until `mapReady` flips to `true` via `requestAnimationFrame` after data arrives. Markers are memoized via `useMemo`.

### Stat Cards

| Stat | Format | Icon |
|---|---|---|
| Total Orders | Integer with locale separator | Clipboard |
| Total Revenue | `formatCurrency()` (sum of `total_amount`) | Dollar circle |
| Total Tax | `formatCurrency()` | Wallet |
| Average Tax Rate | `formatPercent()` | Chart |

### Delivery Map

- Centered on NYC: `[40.75, -73.95]`, zoom 10
- **"Show Zones" checkbox**: Toggles the `TaxZones` overlay which renders colored rectangles for each county's tax zone. When enabled, `<TaxZones />` is rendered inside the `MapContainer`.
- **Marker style**: 10px coral dot with white border and shadow (custom `L.DivIcon`)
- **Clustering**: `MarkerClusterGroup` with `maxClusterRadius={60}`, `chunkedLoading`, custom 3-tier cluster icons:
  - Small (≤30): 36px, coral (#E8573D)
  - Medium (31–100): 44px, coral-dark (#C9422E)
  - Large (>100): 52px, deep coral (#9C3325)
- **Popup**: Shows order ID, `jurisdictions.join(", ")`, tax rate, total amount

### Map Controls

- Page size selector dropdown with options: 300, 500, 1,000, 5,000, All
- Default: 300 orders
- Changing the page size re-renders markers with a loading overlay

### Recent Orders Table

Displays the first 8 orders from `allOrders` in a simple table with columns: **ID, Date, Jurisdictions, Tax (coral), Total (bold)**. Date uses the `created_at` field. Jurisdictions shows `jurisdictions.join(", ")`.

---

## Orders List (`/orders`)

**File**: `src/pages/OrdersPage.tsx`

Full-featured order management page with filtering, sorting, pagination, and order creation.

### Components Used

- `Seo` — Page metadata
- `OrderFilters` — Filter controls
- `Button` (x2) — Create Order + Export CSV
- `Card` — Table container
- `OrdersTable` — TanStack-powered data table
- `Spinner` — Loading state
- `EmptyState` — No orders message
- `Pagination` — Page navigation
- `Modal` — Export modal for CSV export options
- `CreateOrderModal` — Inline order creation

### Data Flow

1. `useOrders()` hook auto-fetches on mount and when filters change
2. `fetchOrders(page?, perPage?)` calls `getOrders(page, perPage, filters)` — both parameters are optional, defaulting to the current store values via `useOrderStore.getState()`
3. Results stored in `useOrderStore` (`orders` + `meta`)
4. Filter changes trigger re-fetch via `useEffect` dependency on `filters`
5. Sort changes update filters, which trigger re-fetch
6. `handlePerPageChange` passes both page (reset to 1) and the new perPage value to `fetchOrders`

### Features

#### Filtering
- Date range (from/to)
- Amount range (min/max)
- Status filter
- Reporting code filter
- Reset button appears when any filter is active

#### Sorting
- Click sortable column headers (Timestamp, Subtotal, Total)
- Toggle between ascending and descending
- Updates `filters.sortBy` and `filters.sortDir` in store

#### Pagination
- Displayed when `meta.totalPages > 1`
- Pagination is rendered **both above and below** the table
- Per-page options: 10, 20, 50, 100
- Page change triggers `fetchOrders(newPage)`
- Per-page change resets to page 1

#### CSV Export
- Button opens an **Export Modal** with two options:
  - **Current page**: Exports only the orders visible on the current page
  - **All pages**: Fetches all orders via `getAllOrders()` then exports (shows loading state while fetching)
- Cancel button closes the modal
- Headers: `id,latitude,longitude,tax_rate,tax_amount,total,jurisdictions,status,reporting_code,created_at`
- Downloads as `orders-export.csv`
- Shows warning toast if no orders, success toast with count after export

#### Create Order
- Button opens `CreateOrderModal`
- On success: closes modal + refetches page 1

#### Error Handling
- Tracks previous error to avoid duplicate toasts
- Shows error toast on fetch failure

---

## CSV Import (`/import`)

**File**: `src/pages/ImportPage.tsx`

A 4-step wizard for bulk importing orders from CSV files.

### Components Used

- `Seo` — Page metadata
- `Badge` (x3) — Step indicators (1. Upload → 2. Preview → 3. Results)
- `Card` — Step container
- `FileDropzone` — File upload area (Step 1)
- `ImportPreview` — Validation table (Step 2)
- `Button` — Back/Import actions (Step 2), Go to Dashboard (Step 4), Clear all orders (Step 1)
- `Modal` — Clear all orders confirmation dialog
- `Spinner` — Parsing state (Step 2) and importing state (Step 3)

### Steps

#### Step 1: Upload (`step === "upload"`)
- `FileDropzone` with `accept=".csv"`
- On file select/drop → calls `processFile(file)` → advances to Preview
- A **"Clear all orders"** danger button is displayed below the upload area. Clicking it opens a confirmation modal.

#### Step 2: Preview (`step === "preview"`)
- Shows filename and row count
- `ImportPreview` displays validation results table
- **Back button**: Returns to Upload step, resets file
- **Import button**: Disabled if no valid rows. Shows count: "Import All (N)"
- Loading spinner while `parsing === true`

**Validation pipeline** (in `useFileUpload` hook):
1. `FileReader.readAsText(file)` reads CSV content
2. `parseCsv(text)` splits into row objects
3. Each row validated against `csvRowSchema` (Zod):
   - `id`: coerced positive integer
   - `longitude`: coerced number, -180 to 180
   - `latitude`: coerced number, -90 to 90
   - `timestamp`: non-empty string
   - `subtotal`: coerced number, min 0.01
4. Returns `ValidatedRow[]` with `{ data, valid, errors }`

#### Step 3: Importing (`step === "importing"`)
- Shows spinner with "Importing..." text
- **Mock mode**: Maps valid rows to `CreateOrderPayload[]` (latitude, longitude, subtotal, timestamp) → calls `mockApi.importCSV(payloads)` → receives imported `Order[]` back → updates Zustand store via `addOrders(imported)` → user sees new orders immediately
- **Real mode**: Sends the raw `File` object to `importCSV(file)` → backend parses the CSV and returns `{ message }` → does **NOT** update the Zustand store → user must navigate away and back (or refresh) to see newly imported orders
- On success → advances to Results (imported count from `validRows.length` in real mode, or actual returned orders in mock mode)
- On failure → reverts step back to "preview" with error toast, allowing the user to retry

#### Step 4: Results (`step === "results"`)
- Success checkmark icon in green circle
- Message: "Successfully imported N orders"
- "Go to Dashboard" button navigates to the dashboard route

### Clear All Orders

A danger button on the upload step that opens a **confirmation modal** before deleting all orders:
- Modal title: "Clear all orders"
- Body: Warning text that the action cannot be undone
- Cancel and Confirm buttons (Confirm shows spinner while in progress)
- On confirm: calls `clearAllOrders()` API (DELETE /orders), then `clearOrders()` to reset the Zustand store
- Shows success or error toast

### Data Flow

1. Upload: `useFileUpload.processFile(file)` → parses and validates (stores both `rows` and raw `File` reference)
2. Import diverges by mode:
   - **Mock**: Builds `CreateOrderPayload[]` from valid rows → `mockApi.importCSV(payloads)` → `addOrders(imported)` appends to `allOrders`
   - **Real**: Sends raw `File` to `importCSV(file)` → backend returns `{ message }` → store is **not** updated (no `addOrders` call)
3. Toast notifications for success/error

---

## Not Found (`*`)

**File**: `src/pages/NotFoundPage.tsx`

404 error page for unmatched routes.

### Components Used

- `Seo` — Page metadata
- `Button` — "Go Home" link

### Content

- Large "404" heading in coral
- "Page not found" title
- Description text
- Button linking to Dashboard (`ROUTES.DASHBOARD` = `/`)

All text is internationalized via `useTranslation()`.
