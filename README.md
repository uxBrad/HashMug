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

## Wallet addresses: what the avatar does and does not do

Seeds that look like Ethereum addresses are normalized (lowercase, `0x`), so EIP-55 case never changes the avatar. Randomness comes from SHA-256 over the whole address, and every trait is snapped to a few clearly different levels so one changed digit gives a visibly different face.

The avatar is a second check for humans, never proof that an address is correct. Always verify the address itself.

Measured with `node packages/core/scripts/grind.mjs` (200,000 random addresses, face style):

| Match standard | Expected addresses to generate to match a random victim |
|---|---|
| Strict (every prominent trait equal) | about 6 x 10^8 (roughly 2^29) |
| Loose (first-glance look: palette, hue, hair side, eyes, mouth) | about 2 x 10^4 |

Read these honestly. A GPU can generate billions of addresses per second, so the avatar alone does not stop a determined attacker. Its value is that it multiplies the work on top of the usual "match the first and last characters" attack. Use it alongside, not instead of, address checks.
