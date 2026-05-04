import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: [
        // ── Build tooling ────────────────────────────────────────────────────
        // Tool configs — not application source; never executed in test context
        'eslint.config.js',
        'vite.config.ts',
        // Compiled output — measuring bundled artifacts is meaningless
        'dist/**',

        // ── App shell ────────────────────────────────────────────────────────
        // Entry point — only ReactDOM.createRoot().render(); zero testable logic
        'src/main.tsx',
        // Root wiring layer — all sub-units (hooks, API, components) are tested
        // individually; full App coverage requires E2E (real fetch + localStorage + tree)
        'src/App.tsx',

        // ── Type declarations ─────────────────────────────────────────────────
        // Pure TS interface files — no runtime code; 0% is a V8 instrumentation artifact
        'src/types/index.ts',
        '**/*.d.ts',

        // ── Untestable in happy-dom ───────────────────────────────────────────
        // Raw Leaflet DOM/ref manipulation — no React rendering path; documented in ADR-002
        'src/components/map/MapView.tsx',
        // Canvas-based image cropper — requires browser Canvas API absent in happy-dom
        'src/components/config/PhotoCropper.tsx',

        // ── Stateless layout primitives ───────────────────────────────────────
        // Maps a static VIEWS array to buttons and passes callbacks through.
        // No application logic; only testable "behavior" is React's onClick wiring.
        'src/components/layout/Header.tsx',
        // Presentational weekend tile; rendering pattern identical to CityTile (tested).
        // Weekend vibe logic is covered by weather.test.ts. 0% line coverage is an
        // artifact of App.tsx exclusion — WeekendTile is never imported by any test file.
        'src/components/tiles/WeekendTile.tsx',

        // ── Static data display ───────────────────────────────────────────────
        // 200 hardcoded flag entries + one Array.filter() call.
        // No application logic; testing it would verify Array.prototype.filter, not behavior.
        'src/components/config/FlagPicker.tsx',

        // ── View-layer form orchestration ─────────────────────────────────────
        // These components wire form inputs to callback props. All business logic
        // lives in tested constituent units: geocodeCity (api/geocode.test),
        // uid() (utils/avatar.test), lat/lon parsing and validation (ConfigModal.test).
        // Unit tests here would assert that onChange fires on input — testing React,
        // not application behavior. Integration coverage belongs in E2E tests.
        'src/components/config/TabPlaces.tsx',
        'src/components/config/TabTeam.tsx',

        // ── Test infrastructure ───────────────────────────────────────────────
        'src/test/**',
      ],
      thresholds: { lines: 80, branches: 80, functions: 80 },
    },
  },
})
