

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/utalk': {
        target: 'https://app-utalk.umbler.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/utalk/, '/api'),
        secure: true,
      }
    }
  }
})
