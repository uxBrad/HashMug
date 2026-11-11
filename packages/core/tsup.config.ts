import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs", "iife"],
  globalName: "Sigil",
  dts: true,
  minify: true,
  clean: true,
});
