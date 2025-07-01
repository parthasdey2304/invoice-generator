import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // This helps with deployment paths
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})
