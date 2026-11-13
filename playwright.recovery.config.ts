import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/rehearsal",
  timeout: 60000,
  workers: 1,
  retries: 0,
  reporter: "list",
  outputDir: "artifacts/recovery-playwright",
  use: { channel: process.env.PLAYWRIGHT_CHANNEL, ...devices["Desktop Chrome"] },
});
