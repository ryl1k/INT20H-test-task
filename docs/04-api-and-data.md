# API & Data Layer

Complete reference for the data layer: HTTP client, API functions, types, validation, mock system, hooks, stores, and utilities.

---

## Axios Client

**File**: `src/api/axiosInstance.ts`

```ts
export const api = axios.create({
  baseURL: baseURL && baseURL !== "mock" ? baseURL : undefined,
  headers: { "Content-Type": "application/json" },
  timeout: 10000
});
```

| Config | Value |
|---|---|
| `baseURL` | From `VITE_API_BASE_URL` env var (omitted in mock mode) |
| `Content-Type` | `application/json` |
| `timeout` | 10,000ms |

**Response interceptor**: Logs errors (`[API Error] {status} {message}`) and rejects with normalized `Error` object.

**Mock mode detection**:
```ts
export const isMockMode = !baseURL || baseURL === "mock";
```

---

## API Functions

**File**: `src/api/ordersApi.ts`

All functions check `isMockMode` and route to either `mockApi` or real Axios calls.

### `getOrders(page, perPage, filters)`

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | `number` | `1` | Page number |
| `perPage` | `number` | `20` | Items per page |
| `filters` | `OrderFilters?` | — | Search, date range, amount range, sort |

**Returns**: `Promise<PaginatedResponse<Order>>`

**Real endpoint**: `GET /orders?page=&per_page=&search=&dateFrom=&...`

---

### `createOrder(payload)`

| Param | Type | Description |
|---|---|---|
| `payload` | `CreateOrderPayload` | `{ latitude, longitude, subtotal, timestamp? }` |

**Returns**: `Promise<Order>` — The created order with computed tax fields.

**Real endpoint**: `POST /orders`

---

### `importCSV(orders)`

| Param | Type | Description |
|---|---|---|
| `orders` | `CreateOrderPayload[]` | Array of order payloads |

**Returns**: `Promise<Order[]>` — Array of created orders.

**Real endpoint**: `POST /orders/import` with body `{ orders }`

---

### `getAllOrders()`

**Returns**: `Promise<Order[]>` — All orders (unpaginated).

**Real endpoint**: `GET /orders/all`

---

## TypeScript Interfaces

**File**: `src/types/order.ts`

### Order

```ts
export interface Order {
  id: number;
  latitude: number;
  longitude: number;
  subtotal: number;
  composite_tax_rate: number;
  tax_amount: number;
  total_amount: number;
  breakdown: TaxBreakdown;
  jurisdictions: Jurisdiction;
  timestamp: string;
}
```

### TaxBreakdown

```ts
export interface TaxBreakdown {
  state_rate: number;
  county_rate: number;
  city_rate: number;
  special_rates: number;
}
```

### Jurisdiction

```ts
export interface Jurisdiction {
  state: string;
  county: string;
  city: string;
  special_districts: string[];
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
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  sortBy?: keyof Order;
  sortDir?: "asc" | "desc";
}
```

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

NY State tax jurisdiction system with 25 counties.

**NY State rate**: 4% (`0.04`)

**County categories**:

| Category | Counties | Total Rate |
|---|---|---|
| NYC (5 boroughs) | New York, Kings, Queens, Bronx, Richmond | 8.875% (4% state + 4.5% county + 0.375% MCTD) |
| Long Island | Nassau, Suffolk | 8.625% (4% state + 4.625% county) |
| MCTD suburbs | Westchester, Rockland, Orange, Dutchess, Putnam | 7.75%–8.375% (includes MCTD surcharge) |
| Upstate | Erie, Monroe, Onondaga, Albany, Niagara, etc. | 7%–8% |
| Default ("Other") | All other locations | 8% (4% state + 4% county) |

**Key functions**:

#### `lookupJurisdiction(lat, lon)`
Iterates through `countyBounds` array (25 bounding boxes) to find the matching county. Returns the full `TaxJurisdiction` object. Falls back to "Other" with 8% total rate.

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
  fetchOrders: (page?: number) => Promise<void>;
  fetchAllOrders: () => Promise<void>;
}
```

- Auto-fetches on mount via `useEffect`
- Re-fetches when `fetchOrders` dependencies change (page, perPage, filters)
- `fetchOrders(page?)`: Calls `getOrders()`, updates store
- `fetchAllOrders()`: Calls `getAllOrders()`, updates `allOrders` in store

### useFileUpload

**File**: `src/hooks/useFileUpload.ts`

CSV file parsing and validation hook.

```ts
function useFileUpload(): {
  rows: ValidatedRow[];
  fileName: string;
  parsing: boolean;
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

**Defaults**:
- `meta`: `{ page: 1, perPage: 20, total: 0, totalPages: 0 }`
- `filters`: `{ sortBy: "timestamp", sortDir: "desc" }`

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
