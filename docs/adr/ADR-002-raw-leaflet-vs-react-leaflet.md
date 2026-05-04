# ADR-002: Raw Leaflet Over react-leaflet

- **Status:** accepted
- **Date:** 2026-04-30
- **Deciders:** Team

## Context

The map tab renders per-city markers containing a weather emoji icon, temperature, and mini avatar circles for team members. The content of each marker is a mix of HTML elements and dynamic data.

## Decision

Use raw Leaflet 1.9.4 directly with `L.divIcon` HTML string markers. Do not introduce `react-leaflet`.

## Design Patterns Used

- **Template Method**: `L.divIcon` accepts an HTML string template that is inserted into the map's overlay pane.
- **Escape Hatch**: Using the raw DOM library directly when the abstraction layer (react-leaflet) cannot provide the required capability.

## Consequences

### Positive
- Markers can contain arbitrary HTML (emoji, images, styled divs) without React portal hacks.
- No additional dependency; Leaflet is already required.
- Map interaction logic is isolated in a single `useRef`-based component.

### Negative
- Marker content is rendered as an HTML string, not as React JSX — no React lifecycle inside markers.
- Images in markers (member avatars) use plain `<img>` tags and cannot use React's error boundary.

### Risks
- If marker content needs React interactivity in the future, migration to react-leaflet + portals would be required.

## Alternatives Considered

| Alternative    | Pros                           | Cons                                              | Reason Rejected                              |
|----------------|--------------------------------|---------------------------------------------------|----------------------------------------------|
| react-leaflet  | React-idiomatic API            | Cannot render React components inside markers without portals | Too complex for mixed-content markers |
| MapLibre GL    | Modern, WebGL-based            | Different API, higher bundle size                 | Overkill for tile-based map with simple markers |
