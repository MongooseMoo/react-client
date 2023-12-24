import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { CommitHashPlugin } from 'vite-plugin-commit-hash';


export default defineConfig({
    plugins: [preact(), CommitHashPlugin()],
    resolve: {
        alias: {
            'react': 'preact/compat',
            'react-dom': 'preact/compat'
        }
    }
});
