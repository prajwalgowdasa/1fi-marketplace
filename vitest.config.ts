import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    exclude: ["tests/e2e/**", "node_modules/**"],
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      thresholds: {
        lines: 85,
        functions: 85,
        statements: 85,
        branches: 80,
      },
    },
  },
});
