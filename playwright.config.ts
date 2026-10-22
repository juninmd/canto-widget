import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.CANTO_E2E_PORT ?? 1420);
const url = `http://localhost:${port}`;

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: url,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 420, height: 580 } } }],
  webServer: {
    // On CI the built bundle loads in a few requests instead of hundreds of dev modules: the suite runs in half the time.
    command: process.env.CI
      ? `bunx vite build && bunx vite preview --port ${port} --strictPort`
      : `bun run dev -- --port ${port}`,
    url,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
