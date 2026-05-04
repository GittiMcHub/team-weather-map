# ADR-001: Build Toolchain — Vite + React + TypeScript + Babel

- **Status:** accepted
- **Date:** 2026-04-30
- **Deciders:** Team

## Context

The project started as a single standalone HTML file bundled by a custom base64/gzip bundler. To make it maintainable, testable, and deployable as a standard web project, it needs a proper build toolchain.

## Decision

Use Vite 5 as the build tool, React 18 as the UI framework, TypeScript (strict mode) as the language, and `@vitejs/plugin-react` (Babel) for JSX/TSX transformation.

## Design Patterns Used

- **Convention over Configuration**: Vite's zero-config defaults handle most project needs.
- **Separation of Concerns**: Source files in `src/` are separated from build output in `dist/`.

## Consequences

### Positive
- `@vitejs/plugin-react` (Babel) fully supports Node 18 with no engine warnings.
- Vite's dev server with HMR enables fast iteration.
- TypeScript strict mode catches bugs at compile time.
- Vitest shares the Vite config, eliminating separate test bundler configuration.

### Negative
- Babel is slower than SWC for large codebases. Not measurable at this project scale.

### Risks
- Node 18 EOL was April 2025. The CI pipeline targets Node 22; the local dev environment runs Node 18 and is supported by the Babel plugin.
- Upgrade to `@vitejs/plugin-react-swc` when the environment moves to Node ≥ 20.

## Alternatives Considered

| Alternative         | Pros                      | Cons                                      | Reason Rejected                    |
|---------------------|---------------------------|-------------------------------------------|------------------------------------|
| Create React App    | Familiar                  | Deprecated, no longer maintained          | Dead project                       |
| Webpack             | Very flexible             | Complex config, slow                      | Vite is simpler and faster         |
| SWC plugin          | Faster transforms          | Requires Node ≥ 20; native binary fails on Node 18 | Runtime incompatibility on dev environment |
