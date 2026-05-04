# ADR-003: localStorage-Only Persistence

- **Status:** accepted
- **Date:** 2026-04-30
- **Deciders:** Team

## Context

The app stores team members, countries, cities, and layout preferences. It needs persistence across page refreshes but does not require server-side storage or cross-device sync.

## Decision

Persist all state in `localStorage` using a typed `useLocalStorage` hook. No backend, no server-side database.

## Design Patterns Used

- **Custom Hook**: `useLocalStorage<T>` encapsulates the read/write/parse logic and exposes a `[value, setter]` tuple identical to `useState`, making it a drop-in replacement.

## Consequences

### Positive
- Zero infrastructure; the app deploys as a pure static site.
- No authentication, API keys, or server costs required.
- Data is immediately available — no network request on load.

### Negative
- Storage is limited to ~5 MB per origin (browser-dependent).
- Profile photos stored as base64 JPEG strings consume significant quota (~10–20 KB each); with many members this approaches the limit.
- No cross-device sync; data is per-browser.
- Private/incognito mode may not persist data.

### Risks
- A user who clears browser data loses all team configuration. Consider warning the user and offering export/import in a future iteration.

## Alternatives Considered

| Alternative        | Pros                          | Cons                               | Reason Rejected             |
|--------------------|-------------------------------|------------------------------------|-----------------------------|
| Backend API + DB   | Cross-device, team-shared     | Requires infrastructure, auth      | Out of scope for this app   |
| IndexedDB          | Larger quota, binary support  | More complex API                   | Overkill for small JSON data |
| URL-encoded state  | Shareable links               | URLs become large; no images       | Not suitable for photos     |
