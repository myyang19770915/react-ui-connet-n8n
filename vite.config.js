import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: './',
  base: '/ihandover',
  build: {
    outDir: 'dist'
  },
  server: {
    host: '0.0.0.0',
    port: 8011,
    open: true,
    allowedHosts: ['test4.txcaix.com', 'txcai.txcaix.com'],
    cors: { origin: 'https://test4.txcaix.com' }
  },
  preview: {
    port: 8011,
    open: true
  }
})
