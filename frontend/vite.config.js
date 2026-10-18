import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Backend port must match server.port in application.properties
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": "http://localhost:8081" } },
});
