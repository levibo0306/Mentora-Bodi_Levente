/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["sprints/02/tests/**/*.{test,spec}.ts"],
    reporters: [
      "default",
      ["junit", { suiteName: "sprint2-tests" }],
    ],
    outputFile: {
      junit: "sprints/02/reports/junit.xml",
    },
    coverage: {
      provider: "v8",
      reporter: [["cobertura", { file: "coverage.xml" }]],
      reportsDirectory: "sprints/02/reports",
      include: ["sprints/02/src/core/**/*.{ts,tsx}"],
      exclude: ["sprints/02/tests/**/*"],
    },
  },
});
