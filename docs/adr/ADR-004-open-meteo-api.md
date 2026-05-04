# ADR-004: Open-Meteo API Integration Strategy

- **Status:** accepted
- **Date:** 2026-04-30
- **Deciders:** Team

## Context

The app needs current weather data and recent historical data (past week for the Weekend tab) for arbitrary lat/lon coordinates worldwide.

## Decision

Use the Open-Meteo API (`https://api.open-meteo.com/v1/forecast`) for all weather data. Implement a 3-retry strategy with exponential backoff (700 ms base delay).

## Design Patterns Used

- **Retry with Exponential Backoff**: `withRetry` retries up to 3 times with delays of 700 ms, 1400 ms, 2100 ms to handle transient network failures.
- **URL Builder**: Use `URL` + `searchParams` instead of template literals to prevent encoding bugs and simplify testing.

## Consequences

### Positive
- Free, no API key required, no CORS restrictions for browser requests.
- Provides both forecast and historical data in a single endpoint.
- `timezone=auto` infers the correct timezone from coordinates.

### Negative
- No SLA or uptime guarantee from Open-Meteo.
- **API migration risk**: Open-Meteo is migrating `weathercode` → `weather_code`. The internal type must be verified against the live API at build time.
- No client-side caching — each city fetches on every page load.

### Risks
- Rate limiting: Open-Meteo imposes limits on free usage. With many cities, parallel requests could trigger rate limiting. Consider adding a per-city debounce if the city count grows beyond ~20.

## Alternatives Considered

| Alternative         | Pros                    | Cons                               | Reason Rejected             |
|---------------------|-------------------------|------------------------------------|-----------------------------|
| OpenWeatherMap      | Well-known, reliable    | Requires API key, has cost         | API key management overhead |
| WeatherAPI          | Good free tier          | Requires API key                   | API key management overhead |
| wttr.in             | Simple, no key          | Limited data, unofficial           | Unreliable for production   |
