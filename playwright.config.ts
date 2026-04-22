import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:4174",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm dev --host localhost --port 4174 --strictPort",
    url: "http://localhost:4174",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
