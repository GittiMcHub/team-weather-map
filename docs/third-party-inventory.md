# Third-Party Inventory

## Runtime Dependencies

| Dependency | Version | License | License Impact | Risk | Notes |
|------------|---------|---------|----------------|------|-------|
| react | ^18.3.1 | MIT | Permissive, no concern | Low | UI framework |
| react-dom | ^18.3.1 | MIT | Permissive, no concern | Low | React DOM renderer |
| leaflet | ^1.9.4 | BSD-2-Clause | Permissive, no concern | Low | Interactive map |

## Dev Dependencies (not shipped)

| Dependency | Version | License | Risk | Notes |
|------------|---------|---------|------|-------|
| vite | ^5.4.10 | MIT | Low | Build tool |
| @vitejs/plugin-react-swc | ^4.3.0 | MIT | Low | SWC transformer for Vite |
| typescript | ~5.6.2 | Apache-2.0 | Low | Type checker |
| vitest | ^2.1.9 | MIT | Low | Test runner |
| @vitest/coverage-v8 | ^2.1.9 | MIT | Low | Coverage reporter |
| @testing-library/react | ^16.3.2 | MIT | Low | Component testing |
| @testing-library/jest-dom | ^6.9.1 | MIT | Low | DOM matchers |
| @testing-library/user-event | ^14.6.1 | MIT | Low | User interaction simulation |
| happy-dom | ^20.9.0 | MIT | Low | DOM environment for tests |
| eslint | ^9.13.0 | MIT | Low | Linter |
| typescript-eslint | ^8.11.0 | MIT | Low | TS-aware ESLint rules |
| eslint-plugin-react | ^7.37.5 | MIT | Low | React ESLint rules |
| eslint-plugin-react-hooks | ^5.0.0 | MIT | Low | React hooks ESLint rules |
| license-checker | Latest | MIT | Low | License validation in CI |

## External Services (no npm package)

| Service | Provider | Cost | Privacy | Notes |
|---------|----------|------|---------|-------|
| Open-Meteo API | Open-Meteo | Free | No PII sent (lat/lon only) | No API key required |
| Nominatim Geocoding | OpenStreetMap | Free | City name string sent; no PII | No API key; max 1 req/sec per usage policy; see ADR-009 |
| CartoDB tile server | CARTO | Free (attribution required) | Tile requests reveal approximate map view | OSM-based tiles |
| Google Fonts CDN | Google | Free | DNS lookup + request logged by Google | Temporary — see ADR-005 |
