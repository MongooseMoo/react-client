import preact from '@preact/preset-vite';
import { fileURLToPath } from 'node:url';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [preact()],
  resolve: {
    mainFields: ['module', 'main'],
    alias: [{
      find: /^@testing-library\/react$/,
      replacement: fileURLToPath(new URL('./node_modules/@testing-library/react/dist/@testing-library/react.esm.js', import.meta.url)),
    }],
  },
  test: {
    // Transform React consumers so their imports honor the Preact aliases.
    server: { deps: { inline: [/@testing-library\/react/, /@livekit\/components-react/, /@react-aria\//, /node_modules\/react-[^/]+\//, /node_modules\/use-[^/]+\//, 'zustand', 'nano-css'] } },
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'tests/**'],
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
});
