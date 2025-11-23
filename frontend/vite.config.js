import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,                      // supaya bisa diakses dari jaringan luar (ngrok)
    allowedHosts: [/\.ngrok-free\.app$/], // izinkan semua subdomain ngrok-free.app
    // kalau mau sekaligus kunci port:
    // port: 5173,
  },
})
