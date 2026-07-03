import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "node:path";
import { constants } from "node:zlib";
import { compression, defineAlgorithm } from "vite-plugin-compression2";

export default defineConfig(({ mode }) => ({
  plugins: [
    preact(),

    compression({
      threshold: 1024,
      algorithms: [
        defineAlgorithm("gzip", {
          level: 9,
        }),
        defineAlgorithm("brotliCompress", {
          params: {
            [constants.BROTLI_PARAM_QUALITY]: 11,
          },
        }),
      ],
      deleteOriginalAssets: false,
      skipIfLargerOrEqual: true,
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@blocks": path.resolve(__dirname, "./src/blocks"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@scripts": path.resolve(__dirname, "./src/scripts"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },

  build: {
    target: "baseline-widely-available",
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: mode !== "production",

    cssCodeSplit: true,
    cssMinify: "lightningcss",
    minify: "oxc",

    modulePreload: {
      polyfill: false,
    },

    assetsInlineLimit: 4096,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,

    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },

        entryFileNames: "assets/js/[name]-[hash].js",
        chunkFileNames: "assets/js/[name]-[hash].js",

        assetFileNames(assetInfo) {
          const name = assetInfo.names?.[0] ?? "";
          const ext = name.split(".").pop();

          if (ext === "css") return "assets/css/[name]-[hash][extname]";

          if (
            ["png", "jpg", "jpeg", "gif", "svg", "webp", "avif"].includes(
              ext ?? "",
            )
          ) {
            return "assets/images/[name]-[hash][extname]";
          }

          if (["woff", "woff2", "ttf", "otf", "eot"].includes(ext ?? "")) {
            return "assets/fonts/[name]-[hash][extname]";
          }

          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
}));
