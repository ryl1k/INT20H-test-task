# API & Data Layer

Complete reference for the data layer: HTTP client, API functions, types, validation, mock system, hooks, stores, and utilities.

---

## Axios Client

**File**: `src/api/axiosInstance.ts`

```ts
export const api = axios.create({
  baseURL: baseURL && baseURL !== "mock" ? baseURL : undefined,
  headers: {
    "Content-Type": "application/json",
    ...(apiKey ? { "x-api-key": apiKey } : {})
  },
  timeout: 10000
});
```

| Config | Value |
|---|---|
| `baseURL` | From `VITE_API_BASE_URL` env var (omitted in mock mode) |
| `Content-Type` | `application/json` |
| `timeout` | 10,000ms |

**Response interceptor**: Logs errors (`[API Error] {status} {message}`) and rejects with a normalized `Error` object (extracts `error.response.data.message` or falls back to `error.message`).

**API key header**: When the `VITE_API_KEY` environment variable is set, the client sends it via the `x-api-key` header on every request.

**Mock mode detection**:
```ts
export const isMockMode = !baseURL || baseURL === "mock";
```

---

## Data Transformation

### normalizeOrder()

**File**: `src/api/ordersApi.ts`

Transforms backend responses into the frontend `Order` interface. The key mapping is `BackendOrder.order` → `Order.id`:

```ts
function normalizeOrder(raw: BackendOrder): Order {
  return {
    id: raw.order,           // ← backend uses "order" as the ID field
    latitude: raw.latitude,
    longitude: raw.longitude,
    composite_tax_rate: raw.composite_tax_rate,
    tax_amount: raw.tax_amount,
    total_amount: raw.total_amount,
    breakdown: raw.breakdown,
    jurisdictions: raw.jurisdictions,
    status: raw.status,
    reporting_code: raw.reporting_code,
    created_at: raw.created_at,
    updated_at: raw.updated_at
  };
}
```

This function is called on every order returned from real API responses (`getOrders`, `createOrder`). Mock mode orders already use the `Order` interface directly and skip normalization.

---

## API Functions

**File**: `src/api/ordersApi.ts`

All functions check `isMockMode` and route to either `mockApi` or real Axios calls.

### `getOrders(page, perPage, filters)`

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | `number` | `1` | Page number |
| `perPage` | `number` | `20` | Items per page |
| `filters` | `OrderFilters?` | — | Date range, amount range, sort, status, reporting code |

**Returns**: `Promise<PaginatedResponse<Order>>`

**Real endpoint**: `GET /orders?page=&pageSize=&from_date=&to_date=&total_amount_min=&total_amount_max=&sort_by=&sort_order=&status=&reporting_code=`

Response envelope is `{ data: { orders: BackendOrder[] | null, total: number } }`. Orders are normalized via `normalizeOrder()` which maps `BackendOrder.order` to `Order.id`.

---

### `createOrder(payload)`

| Param | Type | Description |
|---|---|---|
| `payload` | `CreateOrderPayload` | `{ latitude, longitude, subtotal, timestamp? }` |

**Returns**: `Promise<Order>` — The created order with computed tax fields.

**Real endpoint**: `POST /orders` with JSON body. Response: `{ data: BackendOrder }` (normalized to `Order`).

---

### `importCSV(file)`

| Param | Type | Description |
|---|---|---|
| `file` | `File` | CSV file to upload |

**Returns**: `Promise<{ message: string }>`

**Real endpoint**: `POST /orders/import` with `multipart/form-data`, field name `orders`.

**Mock vs Real mode divergence**:
- **Mock mode**: Reads file text client-side, parses CSV rows into `CreateOrderPayload[]` (latitude, longitude, subtotal, timestamp), calls `mockApi.importCSV(payloads)`, and returns `{ message: "Imported N orders" }`. The caller then uses the returned orders to update the Zustand store via `addOrders()`.
- **Real mode**: Creates `FormData`, appends the raw `File` as field `"orders"`, POSTs to `/orders/import`. Backend returns `{ message }`. The Zustand store is **not** updated — users must navigate away to see imported orders.

---

### `getAllOrders(pageSize?)`

| Param | Type | Default | Description |
|---|---|---|---|
| `pageSize` | `number?` | — | Optional limit on total orders to fetch |

**Returns**: `Promise<Order[]>`

**Implementation details**: Uses a parallel batch fetching strategy with `MAX_PAGE_SIZE = 200` and `MAX_CONCURRENT = 10`:

1. Fetches the first page (`getOrders(1, MAX_PAGE_SIZE)`) to discover the total count from `meta.total`
2. Calculates the remaining pages needed: `Math.ceil(target / MAX_PAGE_SIZE)`
3. If only 1 page is needed, returns immediately (with optional slicing)
4. Fetches remaining pages in parallel batches of up to `MAX_CONCURRENT = 10` using `Promise.all`. For each batch, pages `batch` through `min(batch + MAX_CONCURRENT, totalPages + 1)` are fetched concurrently
5. All results are collected into a single array
6. Final slicing: `pageSize !== undefined ? collected.slice(0, pageSize) : collected`

---

### `clearAllOrders()`

No parameters.

**Returns**: `Promise<void>`

**Real endpoint**: `DELETE /orders` — deletes all orders from the database.

In mock mode: calls `mockApi.clearOrders()`.

---

## TypeScript Interfaces

**File**: `src/types/order.ts`

### BackendOrder

```ts
export interface BackendOrder {
  order: number;          // mapped to `id` via normalizeOrder()
  latitude: number;
  longitude: number;
  composite_tax_rate: number;
  tax_amount: number;
  total_amount: number;
  breakdown: TaxBreakdown;
  jurisdictions: string[];
  status: string;
  reporting_code: string;
  created_at: string;
  updated_at: string;
}
```

### Order

```ts
export interface Order {
  id: number;
  latitude: number;
  longitude: number;
  composite_tax_rate: number;
  tax_amount: number;
  total_amount: number;
  breakdown: TaxBreakdown;
  jurisdictions: string[];   // string array, NOT an object
  status: string;
  reporting_code: string;
  created_at: string;
  updated_at: string;
}
```

### TaxBreakdown

```ts
export interface TaxBreakdown {
  state_rate: number;
  county_rate: number;
  city_rate: number;
  special_rate: number;    // NOT special_rates
}
```

### CreateOrderPayload

```ts
export interface CreateOrderPayload {
  latitude: number;
  longitude: number;
  subtotal: number;
  timestamp?: string;
}
```

### OrderFilters

```ts
export interface OrderFilters {
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  status?: string;
  reportingCode?: string;
}
```

`search` field has been removed. `status` and `reportingCode` fields have been added.

### PaginatedMeta

```ts
export interface PaginatedMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}
```

### PaginatedResponse\<T\>

```ts
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}
```

---

## Zod Validation Schemas

### createOrderSchema

**File**: `src/validation/orderSchema.ts`

```ts
export const createOrderSchema = z.object({
  latitude: z.number()
    .min(40.4, "Latitude must be at least 40.4 (NY State)")
    .max(45.1, "Latitude must be at most 45.1 (NY State)"),
  longitude: z.number()
    .min(-79.8, "Longitude must be at least -79.8 (NY State)")
    .max(-71.8, "Longitude must be at most -71.8 (NY State)"),
  subtotal: z.number()
    .min(0.01, "Subtotal must be greater than 0")
    .max(10000, "Subtotal must be at most $10,000")
});
```

Exports `CreateOrderInput` type inferred from schema.

### csvRowSchema

**File**: `src/validation/csvSchema.ts`

```ts
export const csvRowSchema = z.object({
  id: z.coerce.number().int().positive(),
  longitude: z.coerce.number().min(-180).max(180),
  latitude: z.coerce.number().min(-90).max(90),
  timestamp: z.string().min(1, "Timestamp is required"),
  subtotal: z.coerce.number().min(0.01, "Subtotal must be positive")
});
```

Uses `z.coerce` to handle string-to-number conversion from CSV data. Exports `CsvRowParsed` type.

---

## Mock System

### mockApi

**File**: `src/mocks/mockApi.ts`

In-memory CRUD API with simulated network delays.

| Method | Delay | Description |
|---|---|---|
| `getOrders(page, perPage, filters)` | 300ms | Paginated, filtered, sorted results |
| `createOrder(payload)` | 500ms | Creates order with tax calculation, auto-increments ID |
| `importCSV(payloads)` | 1000ms | Bulk create, prepends to in-memory store |
| `getAllOrders()` | 300ms | Returns copy of all orders |
| `clearOrders()` | — | Clears all orders from in-memory store |

**Filtering** (`applyFilters`):
- `search`: Matches against `id`, `county`, `city` (case-insensitive)
- `dateFrom`/`dateTo`: Timestamp range filtering
- `amountMin`/`amountMax`: Subtotal range filtering
- Sorting: By any `Order` key, ascending or descending (default: `timestamp` desc)

### mockOrders

**File**: `src/mocks/mockOrders.ts`

200 seed orders with pre-calculated tax data. Each raw order has `id`, `longitude`, `latitude`, `timestamp`, `subtotal`. Built into full `Order` objects via `calculateTax()`.

Order dates range from 2025-11-04 to 2025-12-22. Subtotals vary: $25, $45, $50, $75, $108, $120, $180, $200.

### taxRates

**File**: `src/mocks/taxRates.ts`

NY State tax jurisdiction system with 62 counties covering all of New York State.

**NY State rate**: 4% (`0.04`)

**County categories**:

| Category | Counties | Total Rate |
|---|---|---|
| NYC (5 boroughs) | New York, Kings, Queens, Bronx, Richmond | 8.875% (4% state + 4.5% county + 0.375% MCTD) |
| Long Island | Nassau, Suffolk | 8.625% (4% state + 4.625% county) |
| MCTD suburbs | Westchester, Rockland, Orange, Dutchess, Putnam | 7.75%–8.375% (includes MCTD surcharge) |
| Upstate | Erie, Monroe, Onondaga, Albany, Niagara, etc. | 7%–8% |
| Remaining counties | Allegany, Cattaraugus, Cayuga, Chautauqua, Chemung, Chenango, Clinton, Columbia, Cortland, Delaware, Essex, Franklin, Fulton, Genesee, Greene, Hamilton, Herkimer, Jefferson, Lewis, Livingston, Madison, Montgomery, Ontario, Orleans, Oswego, Otsego, Schoharie, Schuyler, Seneca, St. Lawrence, Steuben, Tioga, Warren, Washington, Wayne, Wyoming, Yates | 8% (4% state + 4% county) |
| Default ("Other") | All other locations | 8% (4% state + 4% county) |

**Internal `TaxJurisdiction` interface**: Note that the internal interface uses `special_rates` (plural) for the rate field, while the public `TaxBreakdown` interface exposed to the rest of the app uses `special_rate` (singular). The `calculateTax()` function maps `TaxJurisdiction.special_rates` → `TaxBreakdown.special_rate` when building the breakdown object.

**Key functions**:

#### `lookupJurisdiction(lat, lon)`
Iterates through `countyBounds` array (62 bounding boxes) to find the matching county. Returns the full `TaxJurisdiction` object. Falls back to "Other" with 8% total rate.

#### `calculateTax(lat, lon, subtotal)`
1. Looks up jurisdiction
2. Computes `composite_tax_rate` = sum of all rates
3. Computes `tax_amount` = `subtotal * composite_tax_rate` (rounded to 2 decimals)
4. Computes `total_amount` = `subtotal + tax_amount` (rounded to 2 decimals)
5. Returns `{ composite_tax_rate, tax_amount, total_amount, breakdown, jurisdictions }`

---

## Custom Hooks

### useOrders

**File**: `src/hooks/useOrders.ts`

Bridge between API layer and Zustand store for paginated order fetching.

```ts
function useOrders(): {
  orders: Order[];
  allOrders: Order[];
  meta: PaginatedMeta;
  filters: OrderFilters;
  loading: boolean;
  error: string | null;
  fetchOrders: (page?: number, perPage?: number) => Promise<void>;
  fetchAllOrders: () => Promise<void>;
}
```

- Auto-fetches on mount via `useEffect`
- Re-fetches when `fetchOrders` dependencies change (filters)
- `fetchOrders(page?, perPage?)`: Calls `getOrders()`, updates store. Both parameters default to current store values via `useOrderStore.getState()` to avoid stale closures.
- `fetchAllOrders()`: Calls `getAllOrders()`, updates `allOrders` in store

**StrictMode double-fetch prevention**: A `mountedRef` distinguishes initial mount vs filter changes. On initial mount, an `ignore` flag inside the async IIFE allows cleanup to cancel the stale first request from StrictMode's double-invocation. On subsequent renders (filter changes), `fetchOrders()` is called directly.

### useFileUpload

**File**: `src/hooks/useFileUpload.ts`

CSV file parsing and validation hook.

```ts
function useFileUpload(): {
  rows: ValidatedRow[];
  fileName: string;
  parsing: boolean;
  file: File | null;
  processFile: (file: File) => void;
  reset: () => void;
}
```

**`ValidatedRow`**:
```ts
interface ValidatedRow {
  data: CsvRowParsed;
  valid: boolean;
  errors: string[];
}
```

**`processFile(file)`**:
1. Sets `parsing = true`, stores filename
2. Reads file as text via `FileReader`
3. Parses CSV via `parseCsv(text)`
4. Validates each row against `csvRowSchema`
5. Returns array of `ValidatedRow` objects
6. Sets `parsing = false`

`processFile` also stores the original `File` reference (used by `importCSV` in real mode to send the file directly to the backend).

### useDebounce

**File**: `src/hooks/useDebounce.ts`

Generic debounce hook.

```ts
function useDebounce<T>(value: T, delay?: number): T  // delay default: 300ms
```

Returns debounced value after `delay` milliseconds of inactivity. Uses `setTimeout` with cleanup.

---

## Zustand Stores

### useAuthStore

**File**: `src/store/useAuthStore.ts`

Mock authentication store with `sessionStorage` persistence.

```ts
interface AuthState {
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => boolean;
  signOut: () => void;
}
```

- **Mock credentials**: `admin@wellness.com` / `admin123` (exported as `MOCK_EMAIL` / `MOCK_PASSWORD`)
- **Persistence**: `sessionStorage("auth_session")` — survives page reloads, cleared on tab close
- `signIn()` returns `true` on success, `false` on failure

### useOrderStore

**File**: `src/store/useOrderStore.ts`

Full interface and actions documented in [01-architecture.md](./01-architecture.md#useorderstore-srcstoreuseorderstorets).

**Actions**:

| Action | Description |
|---|---|
| `clearOrders()` | Reset orders, allOrders, and meta to defaults |

**`setOrders` behavior**: When updating orders and meta, `setOrders` preserves the existing `perPage` value from the store: `{ ...meta, perPage: state.meta.perPage }`. This prevents the per-page selection from being overwritten by API response metadata.

**Defaults**:
- `meta`: `{ page: 1, perPage: 20, total: 0, totalPages: 0 }`
- `filters`: `{ sortBy: "created_at", sortDir: "desc" }`

### useUiStore

**File**: `src/store/useUiStore.ts`

Full interface and actions documented in [01-architecture.md](./01-architecture.md#useuistore-srcstoreuseuistorets).

**Toast type**:
```ts
interface Toast {
  id: string;                                      // crypto.randomUUID()
  type: "success" | "error" | "warning" | "info";
  message: string;
}
```

**Sidebar default**: Open on screens `>= 1024px` width.

---

## Utility Functions

### cn

**File**: `src/utils/cn.ts`

```ts
function cn(...inputs: ClassValue[]): string
```

Wrapper around `clsx` for conditional class name merging. Used by all UI components.

### parseCsv

**File**: `src/utils/csvParser.ts`

```ts
function parseCsv(text: string): CsvRow[]
```

Parses CSV text into row objects. Reads the first line as headers, maps subsequent lines to `CsvRow` objects (`{ id, longitude, latitude, timestamp, subtotal }`). Skips empty lines.

**`CsvRow`**: All fields are strings (type coercion handled by Zod in validation step).

### formatCurrency

**File**: `src/utils/formatCurrency.ts`

```ts
function formatCurrency(amount: number): string
```

Uses `Intl.NumberFormat("en-US")` with `style: "currency"`, `currency: "USD"`, 2 decimal places. Example: `formatCurrency(120.5)` → `"$120.50"`.

### formatDate

**File**: `src/utils/formatDate.ts`

```ts
function formatDate(dateStr: string): string
```

Uses `Intl.DateTimeFormat("en-US")` with `year: "numeric"`, `month: "short"`, `day: "numeric"`, `hour: "2-digit"`, `minute: "2-digit"`. Example: `formatDate("2025-11-04T10:17:04Z")` → `"Nov 4, 2025, 10:17 AM"`.

### formatPercent

**File**: `src/utils/formatPercent.ts`

```ts
function formatPercent(rate: number): string
```

Converts decimal rate to percentage string with 3 decimal places. Example: `formatPercent(0.08875)` → `"8.875%"`.

---

## Geographic Constants

**File**: `src/constants/geo.ts`

### NY_BOUNDS_RECT

Bounding rectangle for NY State coordinate validation:

```ts
{
  latMin: 40.4,
  latMax: 45.1,
  lonMin: -79.8,
  lonMax: -71.8
}
```

### NY_MAP_BOUNDS

Leaflet `LatLngBounds` for map panning limits (slightly larger than state):

```ts
L.latLngBounds(
  L.latLng(39.0, -82.0),   // Southwest
  L.latLng(46.5, -69.5)    // Northeast
)
```

### NY_CENTER

Default map center point:

```ts
const NY_CENTER: [number, number] = [42.0, -75.5];
```

### isInNY(lat, lon)

```ts
function isInNY(lat: number, lon: number): boolean
```

Returns `true` if coordinates fall within `NY_BOUNDS_RECT`. Used by `LocationPicker` to validate click/drag positions.
