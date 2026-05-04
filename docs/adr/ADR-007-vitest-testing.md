# ADR-007: Vitest + @testing-library/react for Unit and Component Tests

- **Status:** accepted
- **Date:** 2026-04-30
- **Deciders:** Team

## Context

The project needs automated tests with ≥80% line/branch/function coverage. The test environment must integrate with the Vite build config to avoid a separate bundler setup.

## Decision

Use Vitest 2.x + `@testing-library/react` + `happy-dom` as the test environment. `happy-dom` is used instead of `jsdom` due to an ESM compatibility issue (`@exodus/bytes` / `html-encoding-sniffer`) on Node 18.

Two components are excluded from the coverage threshold:

- `MapView.tsx` — Leaflet requires a real DOM with layout dimensions (width/height); happy-dom does not implement layout.
- `PhotoCropper.tsx` — Canvas API and drag interactions are not reliably implemented in happy-dom.

## Design Patterns Used

- **Behaviour-Driven Testing (BDT)**: Tests assert on rendered output and user interactions, not on internal state.
- **Dependency Injection via Mocking**: `globalThis.fetch` and `setTimeout` are stubbed per-test for the API layer.

## Consequences

### Positive
- Vitest shares the same config, transforms, and module resolution as Vite — no separate Babel/Jest config.
- happy-dom avoids the jsdom/ESM conflict on Node 18.
- Coverage thresholds are enforced on release builds.

### Negative
- happy-dom has less complete DOM API coverage than jsdom. Tests relying on advanced CSS or layout will behave unexpectedly.
- MapView and PhotoCropper are excluded from coverage — their paths must be tested via manual browser testing or future Playwright E2E tests.

### Risks
- When Node 18 is upgraded to ≥20, jsdom should be re-evaluated — it has better DOM fidelity.

## Alternatives Considered

| Alternative | Pros                       | Cons                                   | Reason Rejected                       |
|-------------|----------------------------|----------------------------------------|---------------------------------------|
| Jest        | Familiar, large ecosystem  | Separate config, ESM support complex   | Vite-native Vitest is simpler         |
| jsdom       | Best DOM fidelity          | ESM conflict with @exodus/bytes on N18 | Runtime incompatibility               |
| Playwright  | Real browser testing       | Slower, heavier CI setup               | Deferred to E2E phase                 |
