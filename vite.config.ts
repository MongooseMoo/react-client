import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';
import { CommitHashPlugin } from 'vite-plugin-commit-hash';
import { VitePWA } from 'vite-plugin-pwa';
import { optionalChunks } from './src/build/optionalChunks';
import { webAppManifest } from './src/build/webAppManifest';

let deferredChunks = new Set<string>();

export default defineConfig({
  plugins: [
    preact(),
    CommitHashPlugin(),
    {
      name: 'optional-feature-precache',
      apply: 'build',
      generateBundle(_options, bundle) {
        deferredChunks = optionalChunks(bundle);
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
        // The SoundFont worklet is a `?url` asset, so optionalChunks cannot drop it.
        globIgnores: [
          '**/buttplug_wasm-*.js',
          '**/wasm/**',
          '**/wasm-worker.js',
          '**/spessasynth_processor.min-*.js',
        ],
        manifestTransforms: [
          async (manifest) => ({
            manifest: manifest.filter((entry) => !deferredChunks.has(entry.url)),
            warnings: [],
          }),
        ],
      },
      manifest: webAppManifest,
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
