import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/migrations/',
        '**/seeds/',
        '**/generated/',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@alquemist/database': resolve(__dirname, './packages/database/src'),
      '@alquemist/ui': resolve(__dirname, './packages/ui/src'),
      '@alquemist/types': resolve(__dirname, './packages/types/src'),
    },
  },
})
