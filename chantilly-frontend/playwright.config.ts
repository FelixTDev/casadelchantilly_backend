import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: "http://localhost:4174",
    headless: true,
    viewport: { width: 1440, height: 960 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: "cmd /c npm run dev -- --host localhost --port 4174 --strictPort",
      url: "http://localhost:4174/login",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "cmd /c .\\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=ci",
      cwd: "../chantilly-backend",
      url: "http://localhost:8081/actuator/health",
      reuseExistingServer: true,
      timeout: 180_000,
    },
  ],
});
