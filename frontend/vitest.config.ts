import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.tsx"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    css: false, // Skip CSS processing — Tailwind classes are tested as string attributes
    alias: {
      "@/*": path.resolve(__dirname, "./src/*"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
