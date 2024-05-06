import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { CommitHashPlugin } from 'vite-plugin-commit-hash';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), CommitHashPlugin()]
})