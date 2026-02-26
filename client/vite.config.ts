import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": "/src" } },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/main.tsx",
        "src/test/**",
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/components/**",
        "src/pages/**",
        "src/router/**",
        "src/hooks/**",
        "src/types/**"
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70
      }
    }
  }
});
