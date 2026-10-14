import { defineConfig } from "@playwright/test";

// Not part of `bun run e2e`: these specs write files into docs/prints instead of asserting on behavior.
export default defineConfig({
  testDir: ".",
  testMatch: "**/*.media.ts",
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:1420",
    reuseExistingServer: true,
    timeout: 60_000,
    cwd: "../..",
  },
});
