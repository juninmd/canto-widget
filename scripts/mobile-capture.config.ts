import { defineConfig } from "@playwright/test";

const port = Number(process.env.CANTO_E2E_PORT ?? 1432);
const url = `http://localhost:${port}`;

export default defineConfig({
  testDir: ".",
  testMatch: "capture-mobile.ts",
  outputDir: "../.mobile-captures.tmp",
  workers: 1,
  use: { baseURL: url, browserName: "chromium" },
  webServer: {
    command: `bun run dev -- --port ${port}`,
    url,
    reuseExistingServer: false,
    cwd: "..",
    timeout: 60000,
  },
});
