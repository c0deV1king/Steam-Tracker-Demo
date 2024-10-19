import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  base: '/Steam-Tracker-Demo/',
  server: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/auth\/steam\/return/, to: '/index.html' }
      ]
    }
  }
})
