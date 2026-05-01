import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }
          if (id.includes('lucide-react')) {
            return 'vendor-lucide'
          }
          if (id.includes('react-router')) {
            return 'vendor-router'
          }
          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
