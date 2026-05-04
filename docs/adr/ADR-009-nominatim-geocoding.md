# ADR-009: Nominatim Geocoding for City Lat/Lon Lookup

- **Status:** accepted
- **Date:** 2026-04-30
- **Deciders:** Team

## Context

When adding a new city in the Config modal (Settings → Places → Cities), users must manually enter latitude and longitude. Finding coordinates requires leaving the app and consulting an external map tool. This friction leads to errors (wrong city, swapped coords).

## Decision

Add a **"↯ Look up" button** next to the city Name input. On click, the button calls the Nominatim OpenStreetMap geocoding API with the city name and auto-fills the Lat/Lon fields if a result is found.

**API:** `GET https://nominatim.openstreetmap.org/search?q=<name>&format=json&limit=1`

No API key required. The `User-Agent` header is set to `TeamWeatherMap/1.0` per Nominatim's usage policy.

**Error states:**
- City not found → show "City not found" below the input
- Network/HTTP error → show "Lookup failed"
- Button disabled while loading or when name is empty

**Handler pattern:** Synchronous event handler using `void promise.then().catch().finally()` — consistent with ADR-008, avoids React 18 async event handler error surfacing.

## Consequences

### Positive
- Zero friction coordinate lookup: type city name, click Look up, done.
- No API key or account required.
- Consistent with existing no-key philosophy (Open-Meteo, ADR-004).

### Negative
- Nominatim has a usage policy: max 1 req/sec, no bulk geocoding. Acceptable for manual single-city lookup.
- Result quality depends on search string; ambiguous names (e.g. "Springfield") return the most prominent match.
- Adds a network dependency to the config flow (previously fully offline).

### Risks
- Nominatim may return a wrong result for ambiguous city names. Mitigated: lat/lon fields remain editable; user can correct after lookup.
