import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "iife"],
  globalName: "HashMugAvatar",
  dts: true,
  minify: true,
  clean: true,
  noExternal: ["@hashmug/core"],
});
