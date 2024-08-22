import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import restart from "vite-plugin-restart";
import glsl from "vite-plugin-glsl";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true, // Open to local network and display URL
    open: !("SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env), // Open if it's not a CodeSandbox
  },
  plugins: [
    react(),
    restart({ restart: ["../static/**"] }), // Restart server on static file change
    glsl(), // Handle shader files
  ],
});
