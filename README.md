# Sigil

Deterministic identicons from any string. Zero dependencies, SVG out.

```ts
import { createAvatar } from "@sigil/core";

const svg = createAvatar("brad@example.com");
const small = createAvatar("0xabc...", { grid: 5, tile: "rounded", radius: 0.5, size: 64 });
```

## Layout

```
packages/core        @sigil/core: hash (FNV-1a + mixer), PRNG (Mulberry32), color/contrast, SVG renderer
packages/web-component   (planned) <identicon-avatar>
packages/edge            (planned) Hono / Cloudflare Worker: GET /avatar/:seed.svg
apps/sandbox         Vite harness, hundreds of seeds with live controls
```

## How it works

1. `hashSeed(seed)` gives a 32-bit value (FNV-1a over UTF-8, murmur-style finalizer).
2. `createRng` (Mulberry32) streams values. Color draws come first so options never shift them.
3. Left half of the grid is filled by density, then mirrored. Two colors, 25% accent.
4. Tile colors are nudged in lightness until WCAG contrast with the background is at least 3:1.
5. Square tiles merge into one SVG path per color, so output stays small.

## Roadmap

See `Brain/Projects/Sigil/Backlog.md`.
