import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "chatApp",
      filename: "remoteEntry.js",
      exposes: {
        "./Widget": "./src/Widget.jsx",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  server: {
    port: 4174,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 4174,
    strictPort: true,
  },
  build: {
    target: "esnext",
  },
});
