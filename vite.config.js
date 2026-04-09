import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const DEV_API = "http://localhost:3001";
const PROD_API = "https://folio-api-1.onrender.com";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: mode === "production" ? PROD_API : DEV_API,
        changeOrigin: true,
        secure: mode === "production",
      },
    },
  },
}));
