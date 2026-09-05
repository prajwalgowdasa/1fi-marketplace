import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm exec next build --webpack && pnpm start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: "mobile-chrome", use: { viewport: { width: 390, height: 844 } } },
    {
      name: "desktop-centered",
      use: { viewport: { width: 1280, height: 900 } },
    },
  ],
});
