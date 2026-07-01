import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Only the unit tests under src/ — the Playwright e2e/ specs are run by
    // `npm run test:e2e`, not Vitest.
    include: ["src/**/*.{test,spec}.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
