import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import path from "node:path";
import { constants } from "node:zlib";
import { compression, defineAlgorithm } from "vite-plugin-compression2";

export default defineConfig(({ mode }) => ({
  base: "/aem-dist/",

  plugins: [
    preact(),
    compression({
      threshold: 1024,
      algorithms: [
        defineAlgorithm("gzip", { level: 9 }),
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
      react: path.resolve(__dirname, "./node_modules/preact/compat"),
      "react-dom": path.resolve(__dirname, "./node_modules/preact/compat"),
      "react/jsx-runtime": path.resolve(__dirname, "./node_modules/preact/jsx-runtime"),
      "@": path.resolve(__dirname, "./src"),
      "@blocks": path.resolve(__dirname, "./src/blocks"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },

  build: {
    target: "baseline-widely-available",
    outDir: "aem-dist",
    emptyOutDir: true,
    copyPublicDir: false,
    sourcemap: mode !== "production",
    cssCodeSplit: true,
    cssMinify: "lightningcss",
    minify: "oxc",
    modulePreload: { polyfill: false },
    assetsInlineLimit: 4096,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,

    rolldownOptions: {
      input: path.resolve(__dirname, "src/scripts.ts"),
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) return "vendor";
        },
        entryFileNames: "scripts.js",
        chunkFileNames: "assets/js/[name]-[hash].js",
        assetFileNames(assetInfo) {
          const name = assetInfo.names?.[0] ?? "";
          const ext = name.split(".").pop();

          // The entry stylesheet needs a stable URL for head.html. Styles
          // imported by lazy block chunks retain hashed, split filenames.
          if (name === "scripts.css") return "styles.css";
          if (ext === "css") return "assets/css/[name]-[hash][extname]";
          if (["png", "jpg", "jpeg", "gif", "svg", "webp", "avif"].includes(ext ?? "")) {
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
