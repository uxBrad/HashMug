import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@hashmug/core": fileURLToPath(new URL("../core/src/index.ts", import.meta.url)),
      "@hashmug/png": fileURLToPath(new URL("../png/src/index.ts", import.meta.url)),
    },
  },
});
