import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs", "iife"],
    globalName: "HashMug",
    dts: true,
    minify: true,
    clean: true,
  },
  {
    // Internal overrides: sandbox and tooling only.
    entry: { internal: "src/internal.ts" },
    format: ["esm", "cjs"],
    dts: true,
    minify: true,
  },
]);
