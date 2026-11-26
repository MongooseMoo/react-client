import preact from '@preact/preset-vite';
import { defineConfig, loadEnv } from 'vite';
import { CommitHashPlugin } from 'vite-plugin-commit-hash';
import { VitePWA } from 'vite-plugin-pwa';
import { lazyPackagesAtStartup, optionalChunks } from './src/build/optionalChunks';
import { webAppManifest } from './src/build/webAppManifest';

let deferredChunks = new Set<string>();

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  return {
    plugins: [
      preact(),
      CommitHashPlugin(),
      {
        name: 'optional-feature-precache',
        apply: 'build',
        generateBundle(_options, bundle) {
          const leaks = lazyPackagesAtStartup(bundle);
          if (leaks.length > 0) this.error(`Startup chunks must not carry lazy packages:\n${leaks.join('\n')}`);
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
          target: env.VITE_MOO_HTTP || 'http://mongoose.moo.mud.org:7780',
          changeOrigin: true,
        },
        // Caddy, not the MOO, serves the photo upload folder under /dav/photos/.
        '/dav': {
          target: 'https://mongoose.world',
          changeOrigin: true,
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts', // Optional: if you have setup files
    },
  };
});
