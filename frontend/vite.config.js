import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/v1': 'http://127.0.0.1:4000',
      '/api': 'http://127.0.0.1:5001',
      '/video_feed': 'http://127.0.0.1:5001'
    }
  }
})
