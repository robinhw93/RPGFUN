import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { localSourceSync } from "./tools/vite/localSourceSync";

export default defineConfig({
  plugins: [react(), localSourceSync()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: [".app.github.dev"],
  },
});
