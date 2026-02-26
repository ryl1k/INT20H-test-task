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
- `Spinner` — Map loading overlay

### Data Flow

1. On mount, calls `getAllOrders()` directly (not via `useOrders` hook)
2. Stores result in `useOrderStore.allOrders` via `setAllOrders()`
3. Computes derived stats from `allOrders` in a single memoized pass (`useMemo` with `for...of` loop):
   - **Total Orders**: `allOrders.length`
   - **Total Revenue**: Sum of `subtotal`
   - **Total Tax**: Sum of `tax_amount`
   - **Average Tax Rate**: Mean of `composite_tax_rate`
4. Progressive loading: stats render immediately (no full-page spinner). Map shows a frosted spinner overlay until `mapReady` flips to `true` via `requestAnimationFrame` after data arrives. Markers are memoized via `useMemo`.

### Stat Cards

| Stat | Format | Icon |
|---|---|---|
| Total Orders | Integer with locale separator | Clipboard |
| Total Revenue | `formatCurrency()` | Dollar circle |
| Total Tax | `formatCurrency()` | Wallet |
| Average Tax Rate | `formatPercent()` | Chart |

### Delivery Map

- Centered on NYC: `[40.75, -73.95]`, zoom 10
- **Marker style**: 10px coral dot with white border and shadow (custom `L.DivIcon`)
- **Clustering**: `MarkerClusterGroup` with `maxClusterRadius={60}`, `chunkedLoading`, custom 3-tier cluster icons:
  - Small (≤30): 36px, coral (#E8573D)
  - Medium (31–100): 44px, coral-dark (#C9422E)
  - Large (>100): 52px, deep coral (#9C3325)
- **Popup**: Shows order ID, county, tax rate, total amount

### Recent Orders Table

Displays the first 8 orders from `allOrders` in a simple table with columns: ID, Date, County, Tax (coral), Total (bold).

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
- `CreateOrderModal` — Inline order creation

### Data Flow

1. `useOrders()` hook auto-fetches on mount and when filters change
2. `fetchOrders(page)` calls `getOrders(page, perPage, filters)`
3. Results stored in `useOrderStore` (`orders` + `meta`)
4. Filter changes trigger re-fetch via `useEffect` dependency on `filters`
5. Sort changes update filters, which trigger re-fetch

### Features

#### Filtering
- Text search (debounced 300ms) — matches ID, county, city
- Date range (from/to)
- Amount range (min/max subtotal)
- Reset button appears when any filter is active

#### Sorting
- Click sortable column headers (Timestamp, Subtotal, Total)
- Toggle between ascending and descending
- Updates `filters.sortBy` and `filters.sortDir` in store

#### Pagination
- Displayed when `meta.totalPages > 1`
- Per-page options: 10, 20, 50, 100
- Page change triggers `fetchOrders(newPage)`
- Per-page change resets to page 1

#### CSV Export
- `exportCsv()` function generates CSV blob from current page's orders
- Headers: `id,latitude,longitude,subtotal,tax_rate,tax_amount,total,county,timestamp`
- Downloads as `orders-export.csv`
- Shows warning toast if no orders to export
- Shows success toast with count after export

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
- `Button` — Back/Import actions (Step 2), Import More (Step 4)
- `Spinner` — Parsing state (Step 2) and importing state (Step 3)

### Steps

#### Step 1: Upload (`step === "upload"`)
- `FileDropzone` with `accept=".csv"`
- On file select/drop → calls `processFile(file)` → advances to Preview

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
- Calls `importCSV(payloads)` with valid rows mapped to `CreateOrderPayload`
- On success → advances to Results
- On failure → returns to Preview with error toast

#### Step 4: Results (`step === "results"`)
- Success checkmark icon in green circle
- Message: "Successfully imported N orders"
- "Import More" button resets to Upload step

### Data Flow

1. Upload: `useFileUpload.processFile(file)` → parses and validates
2. Import: `importCSV(payloads)` → API call (mock or real)
3. Store update: `addOrders(imported)` appends to `allOrders`
4. Toast notifications for success/error

---

## Create Order (`/create`)

**File**: `src/pages/CreateOrderPage.tsx`

Standalone page for creating a single order with map-based location selection.

**Note**: This route is **commented out** in `src/router/index.tsx`. The create order functionality is available via the `CreateOrderModal` on the Orders page.

### Components Used

- `Seo` — Page metadata
- `MapContainer` — Map centered on NYC, zoom 10
- `LocationPicker` — Click/drag to set delivery location
- `CreateOrderForm` — Order form with Zod validation

### Layout

Two-column grid on desktop (`lg:grid-cols-[1fr_380px]`):
- Left: Map (responsive height: 300px → 400px → 500px)
- Right: Create order form

### Flow

1. User clicks map → `LocationPicker` sets position (validates NY bounds)
2. Position passed to `CreateOrderForm` as read-only lat/lon
3. User enters subtotal → Zod validation → API call → shows tax breakdown

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
