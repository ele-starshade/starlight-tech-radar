import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    env: {
      GITHUB_API_BASE_URL: 'http://localhost:8080',
      GITLAB_API_BASE_URL: 'http://localhost:8080',
      NODE_ENV: 'test'
    }
  },
  resolve: {
    alias: {
      src: fileURLToPath(new URL('./src', import.meta.url)),
      '#q-app/wrappers': fileURLToPath(new URL('./test/mocks/quasar-wrappers.ts', import.meta.url)),
      '#q-app': fileURLToPath(new URL('./.quasar', import.meta.url)),
    }
  }
})
