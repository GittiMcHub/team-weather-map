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
        'src/components/map/MapView.tsx',
        'src/components/config/PhotoCropper.tsx',
        'src/test/**',
        '**/*.d.ts',
      ],
      thresholds: { lines: 80, branches: 80, functions: 80 },
    },
  },
})
