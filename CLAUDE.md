# CLAUDE.md

Guidance for Claude Code (claude.ai/code) in this repo.
See @README for project overview.
Senior Software Engineer on team. Document architectural choices in @docs. Keep @README quickstart current.

---

## Project: Team Weather Map

Team dashboard with live weather for global office locations. Three views: Today (current conditions), Weekend (last Sat/Sun recap with vibe), Map (tile cards on Leaflet map with auto-zoom and anti-overlap lines to coordinates).

### Tech Stack

| Concern | Solution |
|---|---|
| UI framework | React 18.3.1 (hooks: useState, useEffect, useRef, useCallback) |
| Build | Vite 5 + `@vitejs/plugin-react` (Babel, Node 18 compatible) |
| Language | TypeScript 5.6 (`"strict": true`) |
| Maps | Raw Leaflet 1.9.4 — uses `L.divIcon` HTML markers (see ADR-002) |
| Weather data | Open-Meteo API (free, no API key required) |
| Geocoding | Nominatim / OpenStreetMap (free, no API key; max 1 req/sec) |
| Persistence | `useLocalStorage` hook over browser `localStorage` |
| Tests | Vitest 2 + @testing-library/react + happy-dom |
| Serve | nginx:alpine (Docker multi-stage build) |
| Fonts | Google Fonts CDN (temporary — self-host per ADR-005) |

### Commands

```bash
pnpm run dev           # Start dev server (http://localhost:5173)
pnpm run build         # Type-check + build to dist/
pnpm run test          # Run all tests once
pnpm run test:watch    # Watch mode
pnpm run test:coverage # Run with coverage report (threshold: 80%)
pnpm run lint          # ESLint (0 warnings allowed)
pnpm run type-check    # tsc --noEmit
```

### Docker

```bash
docker compose build && docker compose up   # http://localhost:8080
docker compose exec app wget -q -O- http://localhost/health  # → ok
```

> **Note:** Package manager is pnpm. `ignore-scripts=true` in `.npmrc` disables postinstall hooks for all deps (supply chain hardening). Do not override this.

### Source Structure

```
src/
├── types/index.ts          # All shared TypeScript interfaces
├── constants/index.ts      # LS_KEYS, BREAKPOINTS, AVATAR_COLORS, defaults
├── api/weather.ts          # fetchWeather, fetchWeekendWeather (Open-Meteo, 3-retry)
├── api/geocode.ts          # geocodeCity(name, countryName?) → {lat,lon} | null (Nominatim)
├── hooks/
│   ├── useLocalStorage.ts  # Typed useState-compatible localStorage hook
│   └── useWindowWidth.ts   # Responsive width hook
├── utils/
│   ├── weather.ts          # weatherInfo(code), weekendVibe(sat, sun)
│   ├── grid.ts             # getCols(width, cfg)
│   ├── avatar.ts           # uid(), initials(name)
│   └── configIO.ts         # exportConfig(payload), importConfig(json) — JSON file download/upload
├── components/
│   ├── ui/                 # Avatar, LoadingBar, Field (stateless primitives)
│   ├── tiles/              # CityTile, WeekendTile, DayCol (stateless)
│   ├── map/MapView.tsx     # Leaflet map — uses refs, excluded from coverage
│   ├── config/             # ConfigModal, TabTeam, TabPlaces, TabLayout, PhotoCropper, FlagPicker
│   └── layout/Header.tsx   # Tab switcher + Manage button (stateless)
├── styles/                 # global.css, fonts.css, leaflet-marker.css
├── App.tsx                 # Root: all localStorage state, fetch effects, wiring
├── main.tsx
└── test/setup.ts           # @testing-library/jest-dom import
```

### Key Architectural Decisions

- **Raw Leaflet not react-leaflet** — markers are `L.divIcon` HTML strings mixing emoji, temp, avatar images. react-leaflet can't compose React into markers without portals. See ADR-002.
- **City.lat/lon typed as `number | string`** — form inputs produce strings; `parseFloat` + `isNaN` guard applied on `ConfigModal.handleSave` before persisting.
- **happy-dom not jsdom** — jsdom has ESM conflict (`@exodus/bytes`) on Node 18. See ADR-007.
- **Leaflet CSS imported in MapView.tsx** — keeps dependency co-located with consumer.
- **Vite config imports from `vitest/config`** — required to add `test` block without TypeScript errors.
- **Config export/import uses `File.prototype.text()` not FileReader** — cleaner Promise API; handler kept synchronous (`void file.text().then(...)`) to avoid React 18 async event handler error-tracking surfacing caught exceptions. See ADR-008.
- **Geocode lookup uses same synchronous handler pattern** — `void geocodeCity(...).then(...).catch(...).finally(...)` in TabPlaces. See ADR-009.
- **Map markers use `escapeHtml()` before `L.divIcon` interpolation** — `L.divIcon` sets innerHTML directly; React JSX escaping does not apply. City names, flags, member names all escaped.
- **`buildMapMarkers` updates `layersRef.current` before calling `fitBounds`** — Leaflet can fire `zoomend` synchronously inside `fitBounds`; updating the ref first prevents duplicate markers from stale reads in the event handler.
- **Map tile positions computed in pixel space then converted to lat/lon** — overlap separation runs as a force-iteration loop in screen coordinates; tile positions are recalculated on every `zoomend`.

### localStorage Keys

```ts
'twm-members' | 'twm-countries' | 'twm-cities' | 'twm-cols' | 'twm-weather-cache' | 'twm-weekend-cache'
```

`twm-weather-cache` and `twm-weekend-cache` store `{ date: string; data: WeatherMap | WeekendMap }` and are invalidated when the date changes.

### Open-Meteo Endpoints

```
Current:  GET /v1/forecast?latitude=&longitude=&daily=temperature_2m_max,weathercode&timezone=auto&forecast_days=1
Weekend:  GET /v1/forecast?latitude=&longitude=&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&past_days=7&forecast_days=0
```

⚠️ Open-Meteo migrating `weathercode` → `weather_code`. Verify field name at implementation time.

### Commit Convention

```
type | descriptive message

Types: fix | add | change | refactor
```

Examples:
- `add | weekend vibe tab with Saturday/Sunday weather summary`
- `fix | map markers not updating when city lat/lon changes`
- `change | self-host DM Sans fonts from public/fonts/`

### Current Known Issues / TODOs

- Fonts: Google Fonts CDN — must self-host (ADR-005)
- CSP header: nginx.conf missing Content-Security-Policy (documented in docs/security.md)

---

## Documentation Requirements

Every non-trivial architectural decision needs ADR in `/docs/adr/`. See ADR-001 through ADR-009 for pattern.

Keep all `/docs` stubs current:
- `docs/system-context.md` — external system diagram + interface inventory
- `docs/domain-model.md` — entities, value objects, associations
- `docs/glossary.md` — technical and domain terms
- `docs/third-party-inventory.md` — all dependencies with license and risk
- `docs/security.md` — threat model, compliance, pending TODOs

---

## Build Pipeline Requirements (per project standards)

| Step | Enforcement |
|------|-------------|
| Unit + Acceptance Tests | Always — `npm run test` must pass |
| Type Check | Always — `npm run type-check` must pass |
| Lint | Always — `npm run lint` must pass (0 warnings) |
| Coverage | Dev: informational; Release: fail if < 80% |
| Docker Build | CI only — must pass on main branch |
| Dependency Audit | CI — fail on high severity |
| License Check | CI — fail on non-permissive licenses |