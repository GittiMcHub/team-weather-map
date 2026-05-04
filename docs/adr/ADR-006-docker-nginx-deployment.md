# ADR-006: Docker Multi-Stage Build + nginx:alpine Deployment

- **Status:** accepted
- **Date:** 2026-04-30
- **Deciders:** Team

## Context

The app is a static SPA. It needs to be containerised for consistent deployment across environments.

## Decision

Use a two-stage Docker build: Node 22 Alpine for building, nginx 1.27 Alpine for serving. The nginx config includes SPA fallback routing, long-lived cache headers for hashed assets, a `/health` endpoint, and basic security headers.

## Design Patterns Used

- **Multi-Stage Build**: Separates the build environment (Node.js) from the runtime (nginx), producing a minimal final image.
- **Immutable Assets**: Vite content-hashes all JS/CSS filenames, enabling `Cache-Control: immutable` safely.

## Consequences

### Positive
- Final image is ~25 MB (nginx:alpine base) rather than ~200 MB (node:alpine).
- The build layer is cached in Docker layer cache and CI (GitHub Actions cache).
- `/health` endpoint enables Docker healthchecks and load balancer probes without application code changes.

### Negative
- nginx serves files from memory — not suitable as-is for very large static assets (not a concern for this app).
- Content Security Policy is not yet configured (deferred — see `docs/security.md`).

### Risks
- nginx config must be tested when new asset types are added (e.g., audio, video) to ensure correct MIME types and cache policies.

## Alternatives Considered

| Alternative        | Pros                          | Cons                                | Reason Rejected              |
|--------------------|-------------------------------|-------------------------------------|------------------------------|
| `serve` (Node.js)  | Simple, one stage             | Larger image, Node runtime overhead | nginx is lighter and faster  |
| Caddy              | Auto-HTTPS, simpler config    | Less familiar in teams              | nginx is the standard        |
| Cloudflare Pages   | Free, global CDN              | Vendor lock-in, no Docker           | Docker requirement from spec |
