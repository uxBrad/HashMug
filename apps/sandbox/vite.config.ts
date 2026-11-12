import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const core = (f: string) => fileURLToPath(new URL(`../../packages/core/src/${f}`, import.meta.url));

export default defineConfig({
  resolve: {
    // Order matters: the more specific path first.
    alias: [
      { find: "@hashmug/core/internal", replacement: core("internal.ts") },
      { find: "@hashmug/core", replacement: core("index.ts") },
    ],
  },
});
