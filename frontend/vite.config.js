import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://medical-inventory-platform-qe5s.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
  }
})
