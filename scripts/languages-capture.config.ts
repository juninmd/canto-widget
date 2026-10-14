import { defineConfig } from "@playwright/test";

const port = Number(process.env.CANTO_E2E_PORT ?? 1431);
const url = `http://localhost:${port}`;

export default defineConfig({
  testDir: ".",
  testMatch: "capture-languages.ts",
  outputDir: "../.language-captures.tmp",
  workers: 1,
  use: { baseURL: url, viewport: { width: 420, height: 580 }, browserName: "chromium" },
  webServer: {
    command: `bun run dev -- --port ${port}`,
    url,
    reuseExistingServer: false,
    cwd: "..",
    timeout: 60000,
  },
});
