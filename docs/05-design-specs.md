# Design Specifications

Complete visual design reference for the Instant Wellness Kits application.

---

## Brand Identity

- **App Name**: Instant Wellness Kits
- **Primary Color**: Coral `#E8573D`
- **Logo**: `logo-no-bg.png` (transparent background) in public directory, displayed in sidebar and mobile header

---

## Color System

### Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-coral` | `#E8573D` | Primary brand, buttons, links, active states |
| `--color-coral-light` | `#F4877A` | Hover states, secondary accents |
| `--color-coral-dark` | `#C9422E` | Active/pressed states, hover on primary buttons |

### Warm Neutrals

10-shade palette forming the base of the neutral color scheme:

| Token | Hex |
|---|---|
| `--color-warm-50` | `#FDF8F6` |
| `--color-warm-100` | `#F5EBE6` |
| `--color-warm-200` | `#E8D5CB` |
| `--color-warm-300` | `#D4B5A5` |
| `--color-warm-400` | `#B8917D` |
| `--color-warm-500` | `#9C7462` |
| `--color-warm-600` | `#7D5A4C` |
| `--color-warm-700` | `#5E4238` |
| `--color-warm-800` | `#3E2C25` |
| `--color-warm-900` | `#1F1612` |

### Status Colors

| Token | Hex | Light Variant |
|---|---|---|
| `--color-success` | `#2D9C6F` | `--color-success-light`: `#D1FAE5` |
| `--color-warning` | `#D97706` | `--color-warning-light`: `#FEF3C7` |
| `--color-error` | `#DC2626` | `--color-error-light`: `#FEE2E2` |
| `--color-info` | `#2563EB` | `--color-info-light`: `#DBEAFE` |

### Semantic CSS Custom Properties

Variables that swap between light and dark mode:

| Variable | Light Mode | Dark Mode |
|---|---|---|
| `--bg-primary` | `#FDF8F6` (warm-50) | `#1A1210` |
| `--bg-secondary` | `#FFFFFF` | `#251D1A` |
| `--bg-tertiary` | `#F5EBE6` (warm-100) | `#332822` |
| `--text-primary` | `#1F1612` (warm-900) | `#F5EBE6` (warm-100) |
| `--text-secondary` | `#5E4238` (warm-700) | `#D4B5A5` (warm-300) |
| `--text-muted` | `#9C7462` (warm-500) | `#9C7462` (warm-500) |
| `--border-color` | `#E8D5CB` (warm-200) | `#3E2C25` (warm-800) |
| `--border-light` | `#F5EBE6` (warm-100) | `#332822` |

---

## Typography

### Font Families

| Token | Font Stack | Usage |
|---|---|---|
| `--font-heading` | `"Libre Baskerville", Georgia, serif` | Headings (h1–h6), brand name, section titles |
| `--font-body` | `"IBM Plex Sans", system-ui, sans-serif` | Body text, labels, descriptions |
| `--font-mono` | `"IBM Plex Mono", "Courier New", monospace` | Data values, IDs, currency, percentages, code |

### Font Sources

All fonts loaded from Google Fonts (configured in HTML):
- **Libre Baskerville**: Weights 400, 700
- **IBM Plex Sans**: Weights 400, 500, 600
- **IBM Plex Mono**: Weights 400, 600

### Usage Patterns

- `font-heading`: Section headers, card titles, modal titles, stat labels
- `font-body`: Paragraph text, form labels, filter text, nav items
- `font-mono`: Order IDs (`#123`), currency (`$120.50`), percentages (`8.875%`), table data cells

---

## Spacing & Layout

### Sidebar

| Property | Value |
|---|---|
| Width | 320px (`w-80`, `--spacing-sidebar: 20rem`) |
| Position | Fixed on mobile, static on desktop (`lg:static`) |
| Transition | `translate-x` with `duration-300` |

### Responsive Padding

Main content area uses responsive padding:

```
p-3        (12px) — mobile
sm:p-4     (16px) — ≥640px
md:p-6     (24px) — ≥768px
```

Card padding:
```
p-3        (12px) — mobile
sm:p-4     (16px) — ≥640px
md:p-5     (20px) — ≥768px
```

### Breakpoints

| Name | Width | Usage |
|---|---|---|
| `sm` | 640px | Card padding, filter layout, table responsiveness |
| `md` | 768px | Main padding, card padding, map heights |
| `lg` | 1024px | Sidebar static, grid layouts, map heights |

---

## Component Styling

### Button Variants

| Variant | Background | Text | Hover |
|---|---|---|---|
| `primary` | `bg-coral` (#E8573D) | White | `bg-coral-dark` (#C9422E) |
| `secondary` | `var(--bg-tertiary)` | `var(--text-primary)` | `var(--border-color)` |
| `ghost` | Transparent | `var(--text-secondary)` | `var(--bg-tertiary)` |
| `danger` | `bg-error` (#DC2626) | White | `bg-red-700` |

All buttons: `rounded-lg`, `font-medium`, focus ring `ring-2 ring-coral/50`, disabled: `opacity-50 cursor-not-allowed`.

### Badge Variants

| Variant | Background | Text |
|---|---|---|
| `success` | `#D1FAE5` | `#2D9C6F` |
| `warning` | `#FEF3C7` | `#D97706` |
| `error` | `#FEE2E2` | `#DC2626` |
| `info` | `#DBEAFE` | `#2563EB` |
| `default` | `var(--bg-tertiary)` | `var(--text-secondary)` |

All badges: `rounded-full`, `px-2.5 py-0.5`, `text-xs font-medium`.

### Card

- `rounded-xl`
- `border border-[var(--border-color)]`
- `bg-[var(--bg-secondary)]`
- `shadow-sm`

### Modal

- Portal rendered into `document.body`
- Backdrop: `bg-black/50 backdrop-blur-sm`
- Panel: `rounded-2xl`, `border`, `shadow-xl`, max-width `sm:max-w-lg` (default)
- Focus outline: `focus:outline-none` (panel is focusable but invisible ring)

### Donut Chart (TaxBreakdown)

SVG donut chart used in the TaxBreakdown component to visualize tax rate segments.

| Property | Value |
|---|---|
| viewBox | `0 0 120 120` |
| Chart size class | `h-44 w-44` |
| Radius | 46 |
| Stroke-width | 12 (default), 17 (hovered segment) |
| Segment colors | coral `#E8573D`, coral-light `#F4877A`, warning `#D97706`, success `#2D9C6F` |
| Center text | Composite rate by default; hovered segment's name and rate on hover |
| ARIA | `role="img"` with `aria-label` |

**Interactive behavior**: The donut is **interactive** — segments expand on hover (stroke-width 12 → 17), non-hovered segments fade to 30% opacity, and the center text changes to show the hovered segment's name and rate. This bidirectional hover is synced with the rate grid below the chart: hovering a chart segment highlights the corresponding rate row, and hovering a rate row highlights the corresponding chart segment. Segments with zero value are filtered out.

### Input / Select

- `rounded-lg`
- `border border-[var(--border-color)]`
- `bg-[var(--bg-primary)]`
- Focus: `border-coral ring-2 ring-coral/20`
- Error: `border-error ring-error/20`

---

## Animations

### Global Theme Transitions

All elements transition `background-color`, `border-color`, `color` over 300ms ease:

```css
*, *::before, *::after {
  transition-property: background-color, border-color, color;
  transition-duration: 300ms;
  transition-timing-function: ease;
}
```

Form elements additionally transition `box-shadow`.

### Marker Pulse

2-second infinite pulse animation for recent delivery markers:

```css
@keyframes pulse {
  0%   { transform: scale(1);   opacity: 1;   }
  50%  { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(2);   opacity: 0;   }
}
```

Applied via `.marker-pulse::after` pseudo-element with coral background.

### Toast Slide-in

```css
animate-[slideIn_0.3s_ease]
```

Toasts slide in from the right over 0.3 seconds.

### Spinner

Standard Tailwind `animate-spin` on a bordered circle:
- `border-2 border-coral/30 border-t-coral`
- Creates a rotating indicator effect

### Cluster Hover Scale

Map cluster icons scale up on hover:

```css
.cluster-icon:hover {
  transform: scale(1.1);
}
```

Transition: `transform 200ms ease`.

### StatCard Count-up

800ms eased count-up animation using `requestAnimationFrame`:
- Easing: cubic `1 - (1 - progress)^3` (ease-out)
- Animates from 0 to target value

---

## Map Styling

### Cluster Icons

3-tier system based on child count:

| Tier | Count | Size | Background | Border | Font |
|---|---|---|---|---|---|
| Small | ≤30 | 36x36px | `#E8573D` (coral) | 3px white/80% | 12px mono bold |
| Medium | 31–100 | 44x44px | `#C9422E` (coral-dark) | 3px white/80% | 13px mono bold |
| Large | >100 | 52x52px | `#9C3325` (deep coral) | 4px white/80% | 14px mono bold |

All clusters: circular, white text, shadow `0 2px 8px rgba(232, 87, 61, 0.4)`.

### Dot Markers

Individual delivery markers are 10px coral dots:
```html
<div style="width:10px; height:10px; background:#E8573D;
     border:2px solid #fff; border-radius:50%;
     box-shadow:0 1px 3px rgba(0,0,0,0.3)">
</div>
```

### Leaflet Overrides

```css
.leaflet-container {
  font-family: var(--font-body);
  border-radius: 0.75rem;
}
```

Default Leaflet cluster backgrounds are hidden (`background: transparent !important`).

---

## Dark Mode

### Toggle Mechanism

1. `ThemeToggle` component reads initial state from `localStorage("theme")`
2. On toggle, adds/removes `.dark` class on `document.documentElement`
3. Persists choice to `localStorage`

### CSS Variable Swaps

Dark mode is implemented via CSS custom properties scoped to `.dark`:

```css
:root {
  --bg-primary: #FDF8F6;     /* warm cream */
  --text-primary: #1F1612;   /* warm black */
  /* ... */
}

.dark {
  --bg-primary: #1A1210;     /* dark warm */
  --text-primary: #F5EBE6;   /* warm white */
  /* ... */
}
```

Components reference these variables, so the theme swap is automatic. The 300ms global transition ensures smooth color changes.

---

## Scrollbar

Custom scrollbar styling for WebKit browsers:

| Property | Value |
|---|---|
| Width | 6px |
| Height | 6px |
| Track background | `var(--bg-tertiary)` |
| Thumb background | `var(--color-warm-400)` (#B8917D) |
| Thumb border-radius | 3px |

---

## Accessibility

### Skip-to-Content

`AppLayout` renders a visually hidden link (`.sr-only`) that becomes visible on focus:

```html
<a href="#main-content" class="sr-only focus:not-sr-only ...">
  Skip to content
</a>
```

Styled as a coral pill when focused: `bg-coral text-white px-4 py-2 rounded`.

### ARIA Patterns

| Component | Pattern |
|---|---|
| Modal | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Toast container | `role="status"`, `aria-live="polite"` |
| Spinner | `role="status"`, `aria-label="Loading"` |
| Sidebar nav | `<nav aria-label>`, `aria-current="page"` |
| LanguageSwitch | `aria-expanded`, `aria-haspopup="listbox"`, `role="listbox"`, `role="option"`, `aria-selected` |
| OrdersTable | `aria-sort` on sortable columns, `aria-expanded` on expandable rows |
| FileDropzone | `role="region"`, `aria-label` |
| Map | `role="region"`, `aria-label` |
| DonutChart | `role="img"`, `aria-label` |
| Sort buttons | Dynamic `aria-label` with sort direction |
| ImportPreview | Status icons with `role="img"` and `aria-label` |

### Focus Management

- Modal: Focus trapped within panel, previous focus restored on close
- LanguageSwitch: Roving `tabIndex` with arrow key navigation
- OrdersTable rows: `tabIndex={0}` with `Enter`/`Space` to expand

### Keyboard Navigation

| Component | Keys |
|---|---|
| Modal | `Escape` to close, `Tab`/`Shift+Tab` trapped |
| LanguageSwitch | `ArrowUp`/`ArrowDown` to move, `Enter`/`Space` to select, `Escape` to close |
| OrdersTable | `Enter`/`Space` to expand/collapse rows |
| Sidebar overlay | `Escape` to close |

### Screen Reader Support

- SVG icons marked `aria-hidden="true"` throughout
- StatCard icon container marked `aria-hidden="true"`
- Form inputs linked to labels via `htmlFor`/`id`
- Error messages associated with inputs
- Pagination buttons have descriptive `aria-label` values
- Document `lang` attribute updated on language change

---

## Internationalization (i18n)

### Configuration

**File**: `src/i18n/config.ts`

- Framework: i18next with react-i18next
- Fallback language: English (`en`)
- Persistence: `localStorage("language")`
- Escape value: Disabled (React handles XSS)

### Supported Languages

| Code | Language |
|---|---|
| `en` | English |
| `uk` | Українська (Ukrainian) |
| `pl` | Polski (Polish) |
| `es` | Español (Spanish) |
| `it` | Italiano (Italian) |
| `fr` | Français (French) |
| `de` | Deutsch (German) |

### Translation Key Namespaces

All keys are under the `translation` namespace. Key prefixes:

| Prefix | Usage |
|---|---|
| `app.*` | App name |
| `nav.*` | Navigation labels |
| `signIn.*` | Sign-in page (form labels, error, dev hint, sign out) |
| `dashboard.*` | Dashboard stat labels, section titles |
| `orders.*` | Table headers, filter labels, empty states |
| `createOrder.*` | Form labels, validation messages |
| `import.*` | Import wizard steps, messages, clear orders confirmation |
| `exportModal.*` | Export modal options (current page, all pages, loading) |
| `taxBreakdown.*` | Tax breakdown labels |
| `common.*` | Shared labels (loading, showing, not found, etc.) |
| `toast.*` | Toast notification messages |
| `seo.*` | Page titles and descriptions (including `signInTitle`, `signInDesc`) |
| `theme.*` | Theme mode labels |
| `a11y.*` | Accessibility-only labels (screen reader text) |

### Accessibility i18n Keys (`a11y.*`)

| Key | Usage |
|---|---|
| `a11y.skipToContent` | Skip-to-content link text |
| `a11y.toggleSidebar` | Mobile hamburger button label |
| `a11y.mainNavigation` | Sidebar nav aria-label |
| `a11y.changeLanguage` | Language switch button label |
| `a11y.closeModal` | Modal close button label |
| `a11y.dismissNotification` | Toast dismiss button label |
| `a11y.selectPerPage` | Pagination per-page select label |
| `a11y.previousPage` | Pagination previous button label |
| `a11y.nextPage` | Pagination next button label |
| `a11y.expandRow` | Table row expand label |
| `a11y.collapseRow` | Table row collapse label |
| `a11y.sortAscending` | Sort direction label |
| `a11y.sortDescending` | Sort direction label |
| `a11y.taxChart` | Donut chart aria-label |
| `a11y.deliveryMap` | Dashboard map aria-label |
| `a11y.browseFiles` | File input button text |
