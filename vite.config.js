import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const shellRemoteUrl =
    env.VITE_SHELL_REMOTE_URL || "http://localhost:5173/assets/remoteEntry.js";
  const apiTarget = (env.VITE_API_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );

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
          "./ChatEmptyPage": "./src/pages/empty-chat/index.ts",
          "./ChatConversationPage": "./src/pages/chat/index.ts",
          "./ChatCreateGroupPage": "./src/pages/create-group/index.ts",
          "./ChatSidebar": "./src/widgets/chat-sidebar/ChatSidebar.tsx",
        },
        shared: ["react", "react-dom", "react-router-dom", "@promentorapp/ui-kit"],
      }),
    ],
    server: {
      port: 4174,
      strictPort: true,
      cors: true,
      proxy: {
        "/auth": { target: apiTarget, changeOrigin: true },
      },
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
