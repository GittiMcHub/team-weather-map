# ADR-010: CSS-Only Weather Animations for Tile Backgrounds

- **Status:** accepted
- **Date:** 2026-05-05
- **Deciders:** Team

## Context

Tile cards (CityTile, WeekendTile, map tile markers) display weather conditions as a static emoji + label. Adding ambient background animations keyed to the WMO weather code category (sunny, cloudy, rainy, snowy, stormy) improves at-a-glance readability and visual interest. The feature must be togglable and must not regress performance.

## Decision

Implement weather animations as **pure CSS keyframe classes** in `src/styles/weather-animations.css`, applied conditionally via a `className` prop derived from `weatherAnimationClass(code)` in `src/utils/weather.ts`.

### Animation classes

| Class | Codes | Technique |
|---|---|---|
| `wx-sunny` | 0–3 | `background-position` shift on oversized diagonal gradient |
| `wx-cloudy` | 4–48 | `::before` cloud shape (`border-radius` pill + `box-shadow` bumps) animated via `transform: translateX` |
| `wx-rainy` | 49–67, 78–82 | Three staggered `radial-gradient` ellipse layers scrolled on Y axis; seamless loop (`background-position` delta = `background-size` Y) |
| `wx-snowy` | 68–77 | Three staggered `radial-gradient` circle layers scrolled on Y axis; same seamless loop technique |
| `wx-stormy` | 83–99 | `filter: brightness()` flash keyframe on a dark purple-grey base |

### Key implementation choices

**`!important` on background rules** — tile root divs carry `background: '#fff'` as an inline style. CSS class rules cannot override inline styles without `!important`. Scoped to the five `wx-*` classes only.

**`filter: brightness()` for wx-stormy** — an alternative `::before` white overlay would require `z-index` management to appear above tile content. `filter: brightness()` applies to the entire element (including text and icons) as a composited GPU layer, producing a convincing lightning flash without z-index complexity. `will-change: filter` declared.

**`::before` for wx-cloudy** — the cloud is a positioned pseudo-element so it can be clipped by `overflow: hidden` on the tile and animated with `transform: translateX` (GPU-composited). Requires `position: relative; overflow: hidden` on the tile class.

**Seamless loop for rain/snow** — `background-position` Y delta must equal `background-size` Y exactly; any X delta must equal `background-size` X exactly (or zero). A non-multiple X drift caused a visible snap-jump at every cycle boundary.

**`prefers-reduced-motion`** — all `animation` properties are suppressed in the reduced-motion media query. Background tint/gradient is retained as a static weather cue; the `::before` cloud is hidden (`display: none`).

**Toggle stored in `ColConfig`** — `weatherAnimations: boolean` added to `ColConfig` (existing persisted layout config). Avoids a separate localStorage key; flows through the existing config save/import/export pipe automatically.

**`dataRef` extension in MapView** — `animationsEnabled` is added to `dataRef.current` so the Leaflet `zoomend` closure (registered once at map init) always reads the current value without stale-closure capture.

## Consequences

### Positive
- Zero new runtime dependencies — pure CSS.
- GPU-composited animations (`transform`, `opacity`, `filter`) avoid layout/paint on every frame.
- `prefers-reduced-motion` respected.
- Toggle persists across sessions and is included in config export/import.
- All three tile surfaces (CityTile, WeekendTile, Leaflet divIcon) share the same CSS classes.

### Negative
- `!important` declarations on the animation classes make the background property harder to override in future. Acceptable since the scope is narrow (`wx-*` classes only) and the alternative is restructuring all tile root divs to drop their inline background style.
- `::before` on `.wx-cloudy` and the required `overflow: hidden` clip content that overflows the tile boundary. No current content overflows, but future changes must be aware.
