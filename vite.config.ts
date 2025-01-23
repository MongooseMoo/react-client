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
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        theme_color: '#000000'
      }
    })
  ]
})
