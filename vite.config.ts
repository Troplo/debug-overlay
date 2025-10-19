import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "DebugOverlay",
      fileName: (format) => `debug-overlay.${format}.js`,
    },
    rollupOptions: {
      external: ["vue", "vue-router"], // don't bundle peer deps
      output: [
        {
          format: "es",
          entryFileNames: "debug-overlay.es.js",
          globals: {
            vue: "Vue",
            "vue-router": "VueRouter",
          },
        },
        {
          format: "cjs",
          entryFileNames: "debug-overlay.cjs.js",
          globals: {
            vue: "Vue",
            "vue-router": "VueRouter",
          },
        },
        {
          format: "umd",
          name: "DebugOverlay",
          entryFileNames: "debug-overlay.umd.js",
          globals: {
            vue: "Vue",
            "vue-router": "VueRouter",
          },
        },
      ],
    },
  },
});
