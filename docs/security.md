# Security

## Data at Rest

All data is stored in the browser's localStorage as JSON. No server-side storage exists.

- **Profile photos** are stored as base64-encoded JPEG strings. These are stored only in the user's own browser — they never leave the device. Exported `.json` files will contain these base64 strings and should be treated with the same sensitivity as the localStorage data.
- **No encryption at rest** is applied to localStorage. This is acceptable because the data is non-sensitive team information and weather data.

## Data in Transit

- All outbound requests use HTTPS: Open-Meteo API, CartoDB tile server, Nominatim geocoding API, Google Fonts CDN.
- The Nominatim request sends the city name string (user-entered). No account or PII involved; max 1 req/sec per usage policy.
- The nginx container serves HTTP on port 80. For production, a TLS-terminating proxy (load balancer, Cloudflare, Traefik) should be placed in front of it.

## Network Security

- The app is a static SPA. nginx serves no dynamic content and exposes only port 80.
- Security headers are set in `nginx.conf`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Content Security Policy (CSP): TODO** — A CSP header should be added to restrict sources to:
  - `default-src 'self'`
  - `connect-src 'self' https://api.open-meteo.com`
  - `img-src 'self' data: https:` (data: for base64 photos)
  - `font-src 'self' https://fonts.gstatic.com` (temporary until self-hosted)
  - `style-src 'self' https://fonts.googleapis.com 'unsafe-inline'` (Leaflet inlines styles)

## Threat Model (STRIDE)

| Threat | Vector | Mitigation |
|--------|--------|------------|
| Spoofing | No auth; app is public | Acceptable — no PII or sensitive data |
| Tampering | localStorage can be modified by any JS on the same origin | Input validated on `ConfigModal.handleSave` (lat/lon NaN check) |
| Tampering | Crafted import file could inject unexpected string values into names or city fields | Type guards in `importConfig` enforce structural shape; React JSX escapes all string output |
| Repudiation | No audit log | Out of scope |
| Information Disclosure | Profile photos stored as base64 in localStorage | Photos are user-provided; user controls what is stored |
| DoS | Open-Meteo rate limiting | Retry with backoff; weather + weekend data cached in localStorage by date |
| XSS (React views) | User-supplied names/flags rendered in JSX | React's JSX escapes string output automatically |
| XSS (map markers) | City names, flags, member names embedded in `L.divIcon` HTML string (set via `innerHTML`) | `escapeHtml()` applied to all user-supplied strings before template interpolation in `MapView.tsx` |

## Compliance

This application does not collect or process personal data beyond what the user voluntarily enters in their own browser. No data leaves the device except for outbound weather API calls and map tile requests.

GDPR applicability: The user is both the data controller and data subject for any personal information (names, photos) stored locally.
