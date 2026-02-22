import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { CommitHashPlugin } from 'vite-plugin-commit-hash';

export default defineConfig({
  plugins: [
    react(),
    CommitHashPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        globIgnores: ['**/buttplug_wasm-*.js', '**/wasm/**', '**/wasm-worker.js'],
        runtimeCaching: [{
          urlPattern: /\/wasm\/.*/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'wasm-assets',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 30 * 24 * 60 * 60
            },
            cacheableResponse: {
              statuses: [0, 200]
            }
          }
        }]
      },
      manifest: {
        theme_color: '#000000'
      }
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', // Optional: if you have setup files
  },
})
