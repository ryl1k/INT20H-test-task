# Components Reference

Every reusable component in the project with props, behavior, and file paths.

---

## UI Components

### Button

**File**: `src/components/ui/Button.tsx`

```ts
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}
```

| Variant | Style |
|---|---|
| `primary` (default) | Coral background, white text |
| `secondary` | Tertiary background, primary text |
| `ghost` | Transparent, secondary text |
| `danger` | Red background, white text |

| Size | Padding |
|---|---|
| `sm` | `px-3 py-1.5 text-xs` |
| `md` (default) | `px-4 py-2 text-sm` |
| `lg` | `px-6 py-2.5 text-base` |

**Behaviors**: Focus ring (`ring-2 ring-coral/50`), disabled state (50% opacity, `not-allowed` cursor). Extends native `<button>` attributes.

---

### Card

**File**: `src/components/ui/Card.tsx`

```ts
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean; // default: true
}
```

Renders a `<div>` with rounded corners (`rounded-xl`), border, secondary background, and shadow. Responsive padding: `p-3 sm:p-4 md:p-5` (disabled via `padding={false}`).

---

### StatCard

**File**: `src/components/ui/StatCard.tsx`

```ts
interface StatCardProps {
  label: string;
  value: number;
  format?: (n: number) => string;
  icon?: React.ReactNode;
  loading?: boolean;
}
```

Wraps a `Card` with an animated count-up effect. Animation uses `requestAnimationFrame` over 800ms with cubic easing (`1 - (1 - progress)^3`). If no `format` function is provided, displays as `Math.round(n).toLocaleString()`.

**Overflow handling**: Card has `overflow-hidden`, text container has `min-w-0`, and both label and value use `truncate` to clip with ellipsis at narrow widths.

**Icon**: Displayed in a 48x48px coral-tinted circle (`bg-coral/10 text-coral`), marked `aria-hidden`.

**Loading state**: When `loading` is `true`, the animated value is replaced by a small `Spinner` (size `sm`) inside a container matching the value's height (`h-9`). The label remains visible.

---

### Badge

**File**: `src/components/ui/Badge.tsx`

```ts
interface BadgeProps {
  variant?: "success" | "warning" | "error" | "info" | "default";
  children: React.ReactNode;
  className?: string;
}
```

| Variant | Colors |
|---|---|
| `success` | `bg-success-light text-success` |
| `warning` | `bg-warning-light text-warning` |
| `error` | `bg-error-light text-error` |
| `info` | `bg-info-light text-info` |
| `default` | `bg-tertiary text-secondary` |

Renders as an inline `<span>` with pill shape (`rounded-full`), `text-xs font-medium`.

---

### Modal

**File**: `src/components/ui/Modal.tsx`

```ts
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}
```

**Key behaviors**:
- **Portal rendering**: Uses `createPortal` to render into `document.body`
- **Focus trap**: Cycles focus within modal on `Tab`/`Shift+Tab`
- **Escape to close**: Listens for `Escape` keydown
- **Focus management**: Saves previous focus on open, restores on close
- **Backdrop**: Semi-transparent black overlay with `backdrop-blur-sm`, click to close
- **Accessibility**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` linked to title
- **Close button**: `aria-label={t("a11y.closeModal")}` with X icon

---

### Toast

**File**: `src/components/ui/Toast.tsx`

```ts
// No external props — reads from useUiStore
```

**Toast container**: Fixed bottom-right (`fixed bottom-4 right-4 z-50`), `role="status"`, `aria-live="polite"`.

**ToastItem**: Each toast auto-dismisses after 4000ms. Styled per type:

| Type | Style |
|---|---|
| `success` | `bg-success text-white` |
| `error` | `bg-error text-white` |
| `warning` | `bg-warning text-white` |
| `info` | `bg-info text-white` |

**Animation**: `animate-[slideIn_0.3s_ease]` slide-in effect. Dismiss button with `aria-label={t("a11y.dismissNotification")}`.

---

### Spinner

**File**: `src/components/ui/Spinner.tsx`

```ts
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

| Size | Dimensions |
|---|---|
| `sm` | `h-4 w-4` |
| `md` (default) | `h-6 w-6` |
| `lg` | `h-10 w-10` |

CSS spinner using `animate-spin` with coral border (`border-2 border-coral/30 border-t-coral`). `role="status"`, `aria-label="Loading"`.

---

### EmptyState

**File**: `src/components/ui/EmptyState.tsx`

```ts
interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}
```

Centered layout (`py-16`) with inbox icon (64x64, `aria-hidden`), heading, optional description, and optional action slot.

---

### Input

**File**: `src/components/ui/Input.tsx`

```ts
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}
```

**Features**:
- Auto-generates `id` from `label` if not provided (lowercased, spaces → hyphens)
- `<label>` linked to input via `htmlFor`
- Error state: red border + error message in `text-xs text-error`
- Focus: coral border + coral ring (`focus:border-coral focus:ring-2 focus:ring-coral/20`)
- Full width, rounded, themed background/text

---

### Select

**File**: `src/components/ui/Select.tsx`

```ts
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}
```

Native `<select>` with custom styling. Hides default appearance (`appearance-none`), adds custom chevron SVG. Auto-generates `id` from `label`. Same focus styling as Input.

---

### Pagination

**File**: `src/components/ui/Pagination.tsx`

```ts
interface PaginationProps {
  page: number;
  totalPages: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}
```

Displays "Showing X to Y of Z items" text, per-page selector (10/20/50/100 options), and previous/next buttons. Responsive layout: column on mobile, row on `sm+`.

**Accessibility**: `aria-label` on per-page select and navigation buttons (uses i18n keys).

---

### FileDropzone

**File**: `src/components/ui/FileDropzone.tsx`

```ts
interface FileDropzoneProps {
  accept?: string;
  onFile: (file: File) => void;
  label: string;
  hint?: string;
}
```

**Features**:
- Drag-and-drop: Visual feedback on drag over (coral border + tinted background)
- Click to browse: Hidden `<input type="file">` triggered via styled label
- Upload icon (SVG, `aria-hidden`)
- `role="region"` with `aria-label` set to `label` prop
- Responsive padding: `p-5 sm:p-8 md:p-10`

---

## Layout Components

### AppLayout

**File**: `src/components/layout/AppLayout.tsx`

Root shell wrapping all routes via `<Outlet />`.

**Structure**:
```
<div flex h-screen>
  <a skip-to-content />     <!-- sr-only, visible on focus -->
  <Sidebar />
  <div flex-1>
    <header />              <!-- Mobile only (lg:hidden): hamburger + logo -->
    <main id="main-content">
      <Outlet />            <!-- Routed page content -->
    </main>
  </div>
  <Toast />                 <!-- Fixed notification container -->
</div>
```

**Accessibility**: Skip-to-content link targets `#main-content`. Sets `document.documentElement.lang` from i18n language.

---

### Sidebar

**File**: `src/components/layout/Sidebar.tsx`

**Structure**:
- Mobile overlay (black/50, closes on click or Escape)
- Fixed `<aside>` (width: 320px / `w-80`), slides in/out on mobile (`-translate-x-full` / `translate-x-0`)
- Static on desktop (`lg:static lg:translate-x-0`)

**Navigation items** (defined in `navItems` array):
| Path | Label Key | Icon |
|---|---|---|
| `/` | `nav.dashboard` | Dashboard grid |
| `/orders` | `nav.orders` | Clipboard list |
| `/import` | `nav.import` | Upload arrow |

Uses `NavLink` with active state styling (`bg-coral/10 text-coral`). `aria-current="page"` on active link.

**Footer**: Contains `<LanguageSwitch />`, `<ThemeToggle />`, and a **Sign Out** button that opens a confirmation modal before signing out. On confirm, calls `useAuthStore.signOut()` and navigates to `/sign-in`.

**Brand**: Logo and title link to the Dashboard. Title displays as two lines: "Instant" / "Wellness Kits". A close (X) button is visible on mobile (`lg:hidden`).

**Desktop collapse**: A chevron button in the brand area toggles between expanded (`w-80`) and collapsed (`w-16`, icon-only) modes. When collapsed, nav items show only icons with tooltips, the language switch shows a globe icon with a flyout dropdown, and the theme toggle / sign out show only their icons. The collapse chevron replaces the logo when collapsed and sits next to the title when expanded, with smooth 300ms transition animations.

**Accessibility**: `<nav aria-label={t("a11y.mainNavigation")}>`, semantic `<ul>/<li>` structure.

---

### LanguageSwitch

**File**: `src/components/layout/LanguageSwitch.tsx`

Dropdown selector for 7 languages:

| Code | Label |
|---|---|
| `en` | English |
| `uk` | Українська |
| `pl` | Polski |
| `es` | Español |
| `it` | Italiano |
| `fr` | Français |
| `de` | Deutsch |

**Key behaviors**:
- Opens upward (positioned above trigger: `absolute bottom-full`)
- Keyboard navigation: `ArrowUp`/`ArrowDown` to move, `Enter`/`Space` to select, `Escape` to close
- Saves to `localStorage("language")`
- Shows toast on language change
- Closes on outside click

**Accessibility**: `aria-expanded`, `aria-haspopup="listbox"`, `role="listbox"` on dropdown, `role="option"` on items, `aria-selected` on current language, roving `tabIndex`.

---

### ThemeToggle

**File**: `src/components/layout/ThemeToggle.tsx`

Toggles dark/light mode by adding/removing `.dark` class on `<html>`.

**Behaviors**:
- Reads initial state from `localStorage("theme")`
- Persists preference to `localStorage`
- Shows toast on theme change
- Sun icon (dark mode active → switch to light) / Moon icon (light mode active → switch to dark)
- `aria-label` dynamically set to target mode name

---

## Map Components

### MapContainer

**File**: `src/components/map/MapContainer.tsx`

```ts
interface MapProps {
  center?: [number, number];    // default: NY_CENTER [42.0, -75.5]
  zoom?: number;                // default: 7
  className?: string;           // default: "h-[500px] w-full"
  children?: ReactNode;
  ariaLabel?: string;           // default: "Interactive map"
}
```

Wraps Leaflet's `MapContainer` with:
- OpenStreetMap tile layer
- `maxBounds`: NY_MAP_BOUNDS (lat 39.0–46.5, lon -82.0–-69.5)
- `maxBoundsViscosity`: 0.8
- `minZoom`: 5
- `scrollWheelZoom`: enabled
- Outer `<div role="region" aria-label={ariaLabel}>`

---

### LocationPicker

**File**: `src/components/map/LocationPicker.tsx`

```ts
interface LocationPickerProps {
  position: [number, number] | null;
  onPositionChange: (lat: number, lon: number) => void;
}
```

**Behaviors**:
- Click handler via `useMapEvents`: places marker at click location if within NY bounds (`isInNY` check)
- Draggable marker: validates new position is within NY bounds on `dragend`
- Standard Leaflet marker icon (25x41px)
- Popup showing coordinates: `Delivery: {lat}, {lon}`

---

## Order Components

### OrdersTable

**File**: `src/components/orders/OrdersTable.tsx`

```ts
function OrdersTable({ orders, onSort }: {
  orders: Order[];
  onSort?: (col: string, dir: "asc" | "desc") => void;
})
```

TanStack React Table with 7 columns:

| Column | Sortable | Format |
|---|---|---|
| ID | No | `#123` (mono) |
| Timestamp | Yes | `formatDate()` |
| County/City | No | `County / City` |
| Subtotal | Yes | `formatCurrency()` |
| Tax Rate | No | `formatPercent()` |
| Tax Amount | No | `formatCurrency()` (coral) |
| Total | Yes | `formatCurrency()` (bold) |

**Key behaviors**:
- **Sorting**: Click column header to toggle asc/desc. Arrow indicator on active sort column. `aria-sort` attribute on sortable `<th>`.
- **Expandable rows**: Click any row to expand/collapse tax breakdown detail. `aria-expanded` and keyboard support (`Enter`/`Space`).
- **SortHeader subcomponent**: Button with `aria-label` describing current sort state.

---

### OrderFilters

**File**: `src/components/orders/OrderFilters.tsx`

No external props — reads/writes `useOrderStore` directly.

**Filter fields**:
| Field | Type | Behavior |
|---|---|---|
| Search | Text input | Debounced (300ms via `useDebounce`) |
| Date From | Date input | Filters orders from this date |
| Date To | Date input | Filters orders until this date |
| Amount Min | Number input | Minimum subtotal filter |
| Amount Max | Number input | Maximum subtotal filter |

**Reset button**: Appears when any filter is active. Resets all filters and shows info toast.

---

### CreateOrderForm

**File**: `src/components/orders/CreateOrderForm.tsx`

```ts
interface CreateOrderFormProps {
  latitude: number | null;
  longitude: number | null;
  onSuccess?: () => void;
}
```

**Fields**: Latitude (read-only), Longitude (read-only), Subtotal (number, step 0.01, range 0.01–10000).

**Validation**: `createOrderSchema` (Zod) — validates NY bounds + subtotal range. Displays field-level errors.

**Flow**: Submit → validate → `createOrder()` API call → `addOrders([order])` to store → success toast → calls `onSuccess`. Shows `TaxBreakdown` for the created order.

---

### CreateOrderModal

**File**: `src/components/orders/CreateOrderModal.tsx`

```ts
interface CreateOrderModalProps {
  open: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}
```

Composes `Modal` + `MapContainer` + `LocationPicker` + `CreateOrderForm`. Wide modal (`sm:max-w-6xl`) with scrollable content. Map centered on NYC (`[40.75, -73.95]`, zoom 10). Resets position state on close/success.

---

### TaxBreakdown

**File**: `src/components/orders/TaxBreakdown.tsx`

```ts
interface TaxBreakdownProps {
  order: Order;
}
```

Displays tax rate details with:
- **DonutChart**: Interactive SVG donut (120x120 viewBox, radius 46, stroke-width 12) showing state/county/city/special rate segments. Colors: coral (#E8573D), coral-light (#F4877A), warning (#D97706), success (#2D9C6F). Center text shows composite rate by default; on hover shows the hovered segment's label and rate. `role="img"` with `aria-label`. Segments with zero value are filtered out.
- **Interactive hover**: Bidirectional hover sync between the donut chart and the rate grid. Hovering a chart segment highlights the corresponding rate row (and vice versa). Non-hovered segments fade to 30% opacity; the active segment expands stroke-width from 12 to 17.
- **Rate grid**: 1-2 column grid (`sm:grid-cols-2`) showing each rate as label + formatted percent. Rows highlight on hover with background change and bold text. Cursor is pointer.
- **Jurisdiction badges**: All jurisdictions displayed as `Badge` components with `variant="info"`.

Note: `jurisdictions` is a `string[]` (not an object). Each string is rendered as a badge directly.

The TAX_ROWS config maps to `breakdown` fields: `state_rate`, `county_rate`, `city_rate`, `special_rate`.

---

### ImportPreview

**File**: `src/components/orders/ImportPreview.tsx`

```ts
interface ImportPreviewProps {
  rows: ValidatedRow[];
}
```

Displays validation results for CSV import:
- **Summary badges**: Valid count (success), Invalid count (error), Total count (default)
- **Table**: Sticky header, scrollable (max-height 384px), columns: Status (checkmark/X), ID, Lat, Lon, Subtotal, Errors
- Limits display to first 200 rows
- Status icons use `role="img"` with aria-labels

---

## SEO Components

### Seo

**File**: `src/components/seo/Seo.tsx`

```ts
interface SeoProps {
  title: string;
  description: string;
}
```

Renders `<title>` and meta tags (`description`, `og:title`, `og:description`, `twitter:title`, `twitter:description`). Title format: `"{title} | Instant Wellness Kits"`.
