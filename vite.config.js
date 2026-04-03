import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const shellRemoteUrl = env.VITE_SHELL_REMOTE_URL || "http://localhost:5173/assets/remoteEntry.js";

  return {
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: "chatApp",
        filename: "remoteEntry.js",
        remotes: {
          shell: shellRemoteUrl,
        },
        exposes: {
          "./ChatPage": "./src/pages/chat/index.ts",
        },
        shared: ["react", "react-dom", "react-router-dom"],
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
  };
});
