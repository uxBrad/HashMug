import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/app.ts", "src/worker.ts", "src/node.ts"],
  format: ["esm"],
  dts: { entry: ["src/app.ts"] },
  clean: true,
  // Core is bundled so the Worker has no runtime dependencies besides hono.
  noExternal: ["@hashmug/core"],
  external: ["@resvg/resvg-js"],
});
