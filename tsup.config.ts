import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm", "iife"],
  sourcemap: true,
  clean: true,
  dts: true,
  external: ["vue", "vue-router"]
});
