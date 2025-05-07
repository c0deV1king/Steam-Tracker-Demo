import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: "named",
        ref: true,
      },
      include: "**/*.svg",
    }),
  ],
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  server: {
    allowedHosts: ["steam-tracker.codeviking.io"],
    host: "localhost",
    port: 3001,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
