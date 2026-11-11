import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "iife"],
  globalName: "SigilAvatar",
  dts: true,
  minify: true,
  clean: true,
  noExternal: ["@sigil/core"],
});
