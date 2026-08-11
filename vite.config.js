import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3005,
    host: true,
    proxy: {
      '/api': 'http://localhost:3004'
    }
  },
  preview: {
    port: 3004,
    host: true
  }
})
