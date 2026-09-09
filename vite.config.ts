import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { CommitHashPlugin } from 'vite-plugin-commit-hash';
import { VitePWA } from 'vite-plugin-pwa';
import { optionalAudioChunks } from './src/build/optionalAudioChunks';

let audioChunks = new Set<string>();

export default defineConfig({
  plugins: [
    react(),
    CommitHashPlugin(),
    {
      name: 'optional-audio-precache',
      apply: 'build',
      generateBundle(_options, bundle) {
        audioChunks = optionalAudioChunks(bundle);
      },
    },
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        globIgnores: ['**/buttplug_wasm-*.js', '**/wasm/**', '**/wasm-worker.js'],
        manifestTransforms: [
          async (manifest) => ({
            manifest: manifest.filter((entry) => !audioChunks.has(entry.url)),
            warnings: [],
          }),
        ],
      },
      manifest: {
        theme_color: '#000000',
      },
    }),
  ],
  build: {
    manifest: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://mongoose.moo.mud.org:7780',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts', // Optional: if you have setup files
  },
});
