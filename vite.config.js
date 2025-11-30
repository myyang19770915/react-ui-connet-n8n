import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: './',
  build: {
    outDir: 'dist'
  },
  server: {
    port: 9001,  // 修改為您想要的 port
    open: true
  },
  preview: {
    port: 9001,  // 預覽伺服器的 port
    open: true
  }
})
