# System Context

## System Overview

Team Weather Map is a single-page browser application. It has no backend — all state is stored in the browser's localStorage and all external communication is outbound HTTP from the browser.

## Context Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Team Weather Map (SPA)                        │
│                  served by nginx container                       │
└──┬─────────────────┬─────────────────┬──────────────────────────┘
   │                 │                 │                 │
   ▼                 ▼                 ▼                 ▼
┌──────────────┐ ┌────────────┐ ┌──────────────┐ ┌──────────────────┐
│ Open-Meteo   │ │ CartoDB    │ │ Nominatim    │ │ Google Fonts CDN │
│ API          │ │ Tile Server│ │ Geocoding    │ │ (temporary,      │
│ (weather)    │ │ (map tiles)│ │ (lat/lon     │ │  see ADR-005)    │
└──────────────┘ └────────────┘ │  lookup)     │ └──────────────────┘
                                └──────────────┘
```

## External System Inventory

| System | Owner | Protocol | Data Format | Auth | Direction | Notes |
|--------|-------|----------|-------------|------|-----------|-------|
| Open-Meteo API | Open-Meteo | HTTPS REST | JSON | None | Outbound | Free, no key. See ADR-004 |
| CartoDB Tile Server | CARTO | HTTPS | PNG tiles | None | Outbound | Map background tiles |
| Nominatim Geocoding | OpenStreetMap | HTTPS REST | JSON | None | Outbound | City name → lat/lon; config flow only; max 1 req/sec; see ADR-009 |
| Google Fonts CDN | Google | HTTPS | woff2/CSS | None | Outbound | Temporary — see ADR-005 |
| Browser localStorage | Browser | Web Storage API | JSON | None | Local | All app state + weather/weekend cache |

## Responsibility Matrix

| Interface | Owned By | Notes |
|-----------|----------|-------|
| Weather data fetching | `src/api/weather.ts` | Retry logic, type mapping |
| Geocoding (city → lat/lon) | `src/api/geocode.ts` | Nominatim; called from TabPlaces |
| Map tile rendering | Leaflet library | Configured in `MapView.tsx` |
| State persistence | `useLocalStorage` hook | Typed wrapper over localStorage |
| Font delivery | `public/fonts/` (target) | Currently Google Fonts CDN |
