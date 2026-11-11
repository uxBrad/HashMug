# Sigil

Deterministic identicons from any string. Zero dependencies, SVG out.

```ts
import { createAvatar } from "@sigil/core";

const svg = createAvatar("brad@example.com");
const small = createAvatar("0xabc...", { grid: 5, tile: "rounded", radius: 0.5, size: 64 });
```

## Packages

```
packages/core            @sigil/core: zero-dependency engine. SHA-256 seeding, face avatars, SVG out
packages/web-component   @sigil/web-component: <identicon-avatar>, works in any framework
packages/png             @sigil/png: PNG bytes and raw RGBA pixels (Node, uses resvg)
packages/edge            @sigil/edge: Hono endpoint. Worker (SVG) and Node (SVG + PNG)
apps/sandbox             Vite harness, hundreds of seeds with live controls
```

## Use it

```ts
import { createAvatar, describeFace } from "@sigil/core";
const svg = createAvatar("0xAbC...", { radius: 0.5 });   // face style by default
const traits = describeFace("0xAbC...");                  // palette, eyes, hair, and so on
```

```html
<script type="module" src="@sigil/web-component"></script>
<identicon-avatar seed="0xAbC..." size="64" radius="round" label="Profile picture"></identicon-avatar>
```

```ts
import { avatarPng, avatarPixels } from "@sigil/png";    // Node
const png = avatarPng("0xAbC...", { radius: 0.5 }, 256);
```

```html
<img src="https://your-host/v1/avatar/0xAbC....svg?radius=round" width="64" height="64" alt="">
```

Endpoint: `GET /v1/avatar/{seed}.svg|.png` with query `size` and `radius` only. Immutable cache headers. Cloudflare: `pnpm --filter @sigil/edge build` then `wrangler deploy` (SVG only). Node: `pnpm --filter @sigil/edge start` (SVG and PNG).

The web component sets `role="img"` and a neutral `aria-label` (never the seed, since an address read aloud is noise). Use `label` to name it or `decorative` to hide it.

## One seed, one face

Options are deliberately minimal: `size`, `radius` (presentation) and `normalize` (how the seed text is read). Nothing lets an app change the face, so the same wallet looks the same in every product and nobody can quietly switch off the traits that make faces hard to fake. A different look means a new version (`/v2/`), not a per-app setting.

Trait overrides exist for the sandbox and tests only, under `@sigil/core/internal`. Do not use them in products.

## How it works

1. The seed is normalized, then SHA-256 in counter mode produces the random stream. Every draw happens up front, in a fixed order, so options never shift the stream.
2. Hair from the top, bottom or a side with 1 to 4 bands, eight eye shapes, nine palette modes, patterns, brows, nose and mouth. Continuous traits snap to a few levels so faces differ clearly.
3. Eye, brow, nose and mouth positions are pulled inside a safe circle so round crops never cut features.
4. Eyes and ink are nudged until WCAG contrast with the background is at least 3:1.

## Roadmap

See `Brain/Projects/Sigil/Backlog.md`.

## Wallet addresses: what the avatar does and does not do

Seeds that look like Ethereum addresses are normalized (lowercase, `0x`), so EIP-55 case never changes the avatar. Randomness comes from SHA-256 over the whole address, and every trait is snapped to a few clearly different levels so one changed digit gives a visibly different face.

The avatar is a second check for humans, never proof that an address is correct. Always verify the address itself.

Measured with `node packages/core/scripts/grind.mjs` (random addresses):

| Match standard | Expected addresses to generate to match a random victim |
|---|---|
| Strict (every prominent trait equal) | about 3 x 10^17 (roughly 2^58, block-independence estimate) |
| Loose (thumbnail-visible: palette, hue, hair, background, eye count, shape, size, mouth) | about 10^7 (roughly 2^23.5, measured directly) |

Read these honestly. The loose figure is the weak one: a person glancing at a small avatar matches on it. A GPU can generate billions of addresses per second, so the avatar alone does not stop a determined attacker. Its value is that it multiplies the work on top of the usual "match the first and last characters" attack. Use it alongside, not instead of, address checks.
