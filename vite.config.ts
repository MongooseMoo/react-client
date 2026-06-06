import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { CommitHashPlugin } from 'vite-plugin-commit-hash';

export default defineConfig({
  plugins: [
    react(),
    CommitHashPlugin(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        globIgnores: ['**/buttplug_wasm-*.js', '**/wasm/**', '**/wasm-worker.js'],
      },
      manifest: {
        theme_color: '#000000'
      }
    })
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://mongoose.moo.mud.org:7780",
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', // Optional: if you have setup files
  },
})
