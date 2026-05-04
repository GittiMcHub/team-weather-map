# ADR-008: JSON Config Export / Import via Browser File Download and Upload

- **Status:** accepted
- **Date:** 2026-04-30
- **Deciders:** Team

## Context

All configuration (team members, countries, cities, layout) is persisted to localStorage only (see ADR-003). Users have no way to back up their configuration, migrate it to another browser or device, or share a baseline config with a team member. ADR-003 noted: *"Consider warning the user and offering export/import in a future iteration."* This ADR resolves that TODO.

## Decision

Add client-side JSON export (file download) and JSON import (file upload) to the ConfigModal footer. The exported format reuses the existing `ConfigSavePayload` interface directly — no new schema is introduced.

**Export**: Serialises the current modal's local state to a `Blob` with `application/json` MIME type, triggers a download via a programmatic anchor click, then revokes the object URL. Filename format: `twm-config-YYYY-MM-DD.json`.

**Import**: Reads the uploaded file with `File.prototype.text()`, validates the JSON structure with hand-rolled type guards, then populates the modal's local state. The user still clicks **Save** to commit to localStorage — the existing save/validation path is reused unchanged.

**Validation**: Hand-rolled type-guard helpers (`assertString`, `assertNumber`, `assertArray`, `assertObject`) throw `Error('Invalid config: <field-path> must be …')` on structural mismatch. No schema library is added.

## Design Patterns Used

- **Pure utility functions**: `exportConfig` and `importConfig` in `src/utils/configIO.ts` have no React dependency and are independently testable.
- **Guard-clause validation**: Assertion helpers throw immediately on failure, keeping the validation control flow linear rather than accumulating errors.
- **Progressive enhancement**: Import populates local state only; the existing `handleSave` validation (coord parsing, NaN filter) runs when the user clicks Save.

## Consequences

### Positive
- Users can back up and restore configuration without any server infrastructure.
- Config is portable between browsers and team members.
- Exported files are human-readable, indented JSON.
- No new runtime dependencies.

### Negative
- Profile photos stored as base64 strings make exports potentially large (10–20 KB per member).
- No version field in the export format; future schema changes could break older exported files.

### Risks
- A crafted import file could inject unexpected string values into city names or member names. Mitigated: type guards enforce structural shape; React JSX escapes all string output; no `eval` or `innerHTML` is used.
- Re-importing a config with many large photos may push localStorage toward its quota limit.

## Alternatives Considered

| Alternative | Pros | Cons | Reason Rejected |
|-------------|------|------|-----------------|
| Copy JSON to clipboard | No file system dialog | Unwieldy for large configs with photos | Poor UX |
| URL-encoded share link | One-click share | Photos make URL too large for most browsers | Impractical |
| zod / ajv schema validation | Concise schema definition | New runtime dependency; adds bundle weight | Overkill for a single internal struct |
| IndexedDB export | Better storage quota | User cannot inspect or edit the file | Out of scope |
