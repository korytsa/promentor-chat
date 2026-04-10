import { defineConfig, loadEnv } from "vite";
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
        "./ChatEmptyPage": "./src/pages/empty-chat/index.ts",
        "./ChatConversationPage": "./src/pages/chat/index.ts",
        "./ChatCreateGroupPage": "./src/pages/create-group/index.ts",
        "./ChatProfilePage": "./src/pages/profile/index.ts",
        "./ChatSidebar": "./src/widgets/chat-sidebar/ChatSidebar.tsx",
      },
      shared: [
        "react",
        "react-dom",
        "react-router-dom",
        "@promentorapp/ui-kit",
      ],
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
