import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "chatApp",
      filename: "remoteEntry.js",
      exposes: {
        "./ChatPage": "./src/pages/chat/index.ts",
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
