# Glossary

| Term | Definition | Source / Context |
|------|------------|------------------|
| WMO weather code | Numeric code from the World Meteorological Organisation describing weather condition (0=clear, 1-3=partly cloudy, etc.) | Open-Meteo API |
| Weekend vibe | A summarised emoji + text description of the past Saturday/Sunday weather at a city | App domain |
| divIcon | Leaflet API for creating map markers from arbitrary HTML strings | Leaflet |
| SWC | Speedy Web Compiler — a Rust-based JavaScript/TypeScript compiler, faster than Babel | Build toolchain |
| ColConfig | The user's grid column configuration per responsive breakpoint | App domain |
| localStorage quota | Browser-enforced storage limit (~5 MB per origin); exceeded writes fail silently | Web platform |
| SPA fallback | nginx `try_files $uri /index.html` rule that routes all unknown paths to the React app | Deployment |
| happy-dom | Lightweight DOM implementation for Node.js test environments; alternative to jsdom | Testing |
| Content hash | A hash of file contents appended to the filename by Vite (e.g., `index-BJX5nFa8.js`), enabling safe long-lived caching | Build toolchain |
| Open-Meteo | Free weather API providing forecast and historical data by lat/lon coordinate, no API key required | External service |
| Config export | A browser-initiated JSON file download of the current team configuration (`twm-config-YYYY-MM-DD.json`) | App domain |
| Config import | Uploading a previously exported `.json` file to restore or migrate team configuration; populates modal state before the user saves | App domain |
| Nominatim | OpenStreetMap's free geocoding API; converts a city name string to lat/lon; no API key required; max 1 req/sec per usage policy | External service |
| FlagPicker | Modal component in the ConfigModal Places tab for selecting a country flag emoji from a predefined grid | App domain |
| Weather cache | localStorage entry (`twm-weather-cache`) storing today's current-weather results keyed by city ID; invalidated daily | App domain |
| Weekend cache | localStorage entry (`twm-weekend-cache`) storing this week's Saturday/Sunday weather results; invalidated daily | App domain |
| Map tile card | The info card shown per city on the Map view — contains flag, city name, weather icon, temperature, and member avatars; rendered via `L.divIcon` | App domain |
