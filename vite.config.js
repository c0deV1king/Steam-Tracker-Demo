import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [react(), svgr()],
  base: '/Steam-Tracker-Demo/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
