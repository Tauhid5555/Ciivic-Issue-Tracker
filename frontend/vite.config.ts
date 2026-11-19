import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The browser talks to /v1 on its own address; in development Vite forwards it to the backend.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/v1": "http://localhost:8000" } },
});
