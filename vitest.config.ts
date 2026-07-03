import { defineConfig } from "vitest/config";
import preact from "@preact/preset-vite";
import path from "node:path";

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      "react": path.resolve(__dirname, "./node_modules/preact/compat"),
      "react-dom": path.resolve(__dirname, "./node_modules/preact/compat"),
      "react/jsx-runtime": path.resolve(__dirname, "./node_modules/preact/jsx-runtime"),
      "@": path.resolve(__dirname, "./src"),
      "@blocks": path.resolve(__dirname, "./src/blocks"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@models": path.resolve(__dirname, "./src/types"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    setupFiles: ["./tests/unit/setup.ts"],
    css: true,
    coverage: { reporter: ["text", "html"] },
    server: { deps: { inline: ["@tanstack/react-query"] } },
  },
});
