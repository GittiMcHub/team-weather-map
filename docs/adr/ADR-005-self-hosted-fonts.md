# ADR-005: Self-Hosted Fonts

- **Status:** proposed
- **Date:** 2026-04-30
- **Deciders:** Team

## Context

The app uses DM Mono (400, 500) and DM Sans (300, 400, 500) typefaces. The original standalone HTML had these fonts embedded as base64-encoded woff2 files inside the bundle.

## Decision

Self-host the woff2 font files in `public/fonts/` and declare them via `@font-face` in `src/styles/fonts.css`. **Current status: temporarily using Google Fonts CDN** while the woff2 files are extracted from the original bundle.

## Design Patterns Used

- **Asset Inlining / Static Hosting**: Fonts are served as static assets from the same origin, eliminating third-party DNS lookups.

## Consequences

### Positive
- No third-party tracking (Google Fonts analytics).
- No external DNS lookup on page load — faster first contentful paint.
- Works fully offline (intranet, air-gapped environments).

### Negative
- Fonts are not cached across origins (unlike Google Fonts CDN which many users' browsers already have cached).
- The woff2 files add ~100 KB to the Docker image.

### Risks
- The temporary Google Fonts CDN fallback means the current deployment contacts fonts.googleapis.com — this should be resolved before production use.

## Alternatives Considered

| Alternative        | Pros                               | Cons                              | Reason Rejected             |
|--------------------|------------------------------------|-----------------------------------|-----------------------------|
| Google Fonts CDN   | Cross-origin cache, easy setup     | Third-party tracking, requires internet | Privacy concern          |
| @fontsource npm    | npm-managed, tree-shaken           | Adds build complexity             | Acceptable, but extraction is simpler |
