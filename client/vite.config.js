import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxying /api to the FastAPI backend during development means the
// React app can always call relative paths like `/api/items` without
// worrying about CORS or hardcoding a host/port.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})