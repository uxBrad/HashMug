// Regenerates test/vectors.json. Run only with a deliberate output-contract change:
//   pnpm --filter @hashmug/core build && node packages/core/scripts/vectors.mjs
import { createAvatar, sha256, toHex } from "../dist/index.js";
import { writeFileSync } from "node:fs";

const inputs = [
  { seed: "" },
  { seed: "a" },
  { seed: "uxbrad.eth" },
  { seed: "@uxbrad" },
  { seed: "hello@example.com" },
  { seed: "Amara Okafor" },
  { seed: "Zoë Ångström 日本語 🙂" },
  { seed: "  padded  " },
  { seed: "x".repeat(2000) },
  { seed: "0xabcdef0123456789abcdef0123456789abcdef01", options: { normalize: "ethereum" } },
  { seed: "0xABCDEF0123456789ABCDEF0123456789ABCDEF01", options: { normalize: "ethereum" } },
  { seed: "0xabcdef0123456789abcdef0123456789abcdef01" },
  { seed: "copper.eth", options: { radius: 0.5 } },
  { seed: "copper.eth", options: { radius: 0.25, size: 48 } },
  { seed: "7c9e6679-7425-40de-944b-e07fc1f90ae7", options: { size: 256 } },
  ...Array.from({ length: 24 }, (_, i) => ({ seed: `vector-${i}` })),
];

const h = (s) => toHex(sha256(Array.from(new TextEncoder().encode(s))));
const out = inputs.map((i) => ({ ...i, sha256: h(createAvatar(i.seed, i.options)) }));
writeFileSync(new URL("../test/vectors.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
console.log(out.length, "vectors written");
