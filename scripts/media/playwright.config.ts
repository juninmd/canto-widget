import { defineConfig } from "@playwright/test";

/** `CANTO_MEDIA_PORT` lets a shot run while something else holds 1420, like the e2e suite's CANTO_E2E_PORT. */
const port = Number(process.env.CANTO_MEDIA_PORT ?? 1420);
const url = `http://localhost:${port}`;

// Not part of `bun run e2e`: these specs write files into docs/prints instead of asserting on behavior.
export default defineConfig({
  testDir: ".",
  testMatch: "**/*.media.ts",
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: `bun run dev -- --port ${port}`,
    url,
    reuseExistingServer: true,
    timeout: 60_000,
    cwd: "../..",
  },
});
