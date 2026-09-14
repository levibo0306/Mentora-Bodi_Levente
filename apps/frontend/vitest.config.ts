/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.{test,spec}.ts"],
    reporters: [
      "default",
      ["junit", { suiteName: "sprint2-tests" }],
    ],
    outputFile: {
      junit: "../../docs/sprint-02/reports/junit.xml",
    },
    coverage: {
      provider: "v8",
      reporter: [["cobertura", { file: "coverage.xml" }]],
      reportsDirectory: "../../docs/sprint-02/reports",
      include: ["src/core/**/*.{ts,tsx}"],
      exclude: ["tests/**/*"],
    },
  },
});
