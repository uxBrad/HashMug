# HashMug

Deterministic identicons from any string. Zero dependencies, SVG out.

```ts
import { createAvatar } from "@hashmug/core";

const svg = createAvatar("brad@example.com");
const round = createAvatar("0xabc...", { radius: 0.5, size: 64 });
```

## Examples

Any text works as a seed: names, handles, emails, ENS names, wallet addresses. Same seed, same face, everywhere.

| <img src="docs/avatars/copper.svg" width="110" alt="Avatar for copper.eth"> | <img src="docs/avatars/lantern.svg" width="110" alt="Avatar for lantern.eth"> | <img src="docs/avatars/velvet.svg" width="110" alt="Avatar for velvet.eth"> | <img src="docs/avatars/ember.svg" width="110" alt="Avatar for ember.eth"> | <img src="docs/avatars/quartz.svg" width="110" alt="Avatar for quartz.eth"> |
|---|---|---|---|---|
| `copper.eth` | `lantern.eth` | `velvet.eth` | `ember.eth` | `quartz.eth` |
| <img src="docs/avatars/tundra.svg" width="110" alt="Avatar for tundra.eth"> | <img src="docs/avatars/origami.svg" width="110" alt="Avatar for origami.eth"> | <img src="docs/avatars/mosaic.svg" width="110" alt="Avatar for mosaic.eth"> | <img src="docs/avatars/paper-crane.svg" width="110" alt="Avatar for paper-crane.eth"> | <img src="docs/avatars/bob-example-org.svg" width="110" alt="Avatar for bob@example.org"> |
| `tundra.eth` | `origami.eth` | `mosaic.eth` | `paper-crane.eth` | `bob@example.org` |
| <img src="docs/avatars/amara-okafor.svg" width="110" alt="Avatar for Amara Okafor"> | <img src="docs/avatars/priya-shah.svg" width="110" alt="Avatar for Priya Shah"> | <img src="docs/avatars/starlit.svg" width="110" alt="Avatar for @starlit"> | <img src="docs/avatars/pocketwatch.svg" width="110" alt="Avatar for @pocketwatch"> | <img src="docs/avatars/eth-e5c7.svg" width="110" alt="Avatar for 0x03e9…e5c7"> |
| `Amara Okafor` | `Priya Shah` | `@starlit` | `@pocketwatch` | `0x03e9…e5c7` |

One changed character gives a visibly different face. These two addresses differ only in the last digit (`...7b2c` and `...7b2d`):

<img src="docs/avatars/eth-7b2c.svg" width="110" alt="Avatar for address ending 7b2c"> <img src="docs/avatars/eth-7b2d.svg" width="110" alt="Avatar for address ending 7b2d">

Regenerate with `pnpm --filter @hashmug/core build && node packages/core/scripts/examples.mjs`.

## Packages

```
packages/core            @hashmug/core: zero-dependency engine. SHA-256 seeding, face avatars, SVG out
packages/web-component   @hashmug/web-component: <identicon-avatar>, works in any framework
packages/png             @hashmug/png: PNG bytes and raw RGBA pixels (Node, uses resvg)
packages/edge            @hashmug/edge: Hono endpoint. Worker (SVG) and Node (SVG + PNG)
apps/sandbox             Vite harness, hundreds of seeds with live controls
```

## Use it

```ts
import { createAvatar, describeFace } from "@hashmug/core";
const svg = createAvatar("0xAbC...", { radius: 0.5 });   // face style by default
const traits = describeFace("0xAbC...");                  // palette, eyes, hair, and so on
```

```html
<script type="module" src="@hashmug/web-component"></script>
<identicon-avatar seed="0xAbC..." size="64" radius="round" label="Profile picture"></identicon-avatar>
```

```ts
import { avatarPng, avatarPixels } from "@hashmug/png";    // Node
const png = avatarPng("0xAbC...", { radius: 0.5 }, 256);
```

```html
<img src="https://your-host/v1/avatar/0xAbC....svg?radius=round" width="64" height="64" alt="">
```

Endpoint: `GET /v1/avatar/{seed}.svg|.png` with query `size` and `radius` only. Immutable cache headers. Cloudflare: `pnpm --filter @hashmug/edge build` then `wrangler deploy` (SVG only). Node: `pnpm --filter @hashmug/edge start` (SVG and PNG).

The web component sets `role="img"` and a neutral `aria-label` (never the seed, since an address read aloud is noise). Use `label` to name it or `decorative` to hide it.

## One seed, one face

Options are deliberately minimal: `size`, `radius` (presentation) and `normalize` (how the seed text is read). Nothing lets an app change the face, so the same wallet looks the same in every product and nobody can quietly switch off the traits that make faces hard to fake. A different look means a new version (`/v2/`), not a per-app setting.

Trait overrides exist for the sandbox and tests only, under `@hashmug/core/internal`. Do not use them in products.

## How it works

1. The seed is normalized, then SHA-256 in counter mode produces the random stream. Every draw happens up front, in a fixed order, so options never shift the stream.
2. Hair from the top, bottom or a side with 1 to 4 bands, eight eye shapes, nine palette modes, patterns, brows, nose and mouth. Continuous traits snap to a few levels so faces differ clearly.
3. Eye, brow, nose and mouth positions are pulled inside a safe circle so round crops never cut features.
4. Eyes and ink are nudged until WCAG contrast with the background is at least 3:1.

## Roadmap

See [ROADMAP.md](ROADMAP.md).

## Wallet addresses: what the avatar does and does not do

Seeds that look like Ethereum addresses are normalized (lowercase, `0x`), so EIP-55 case never changes the avatar. Randomness comes from SHA-256 over the whole address, and every trait is snapped to a few clearly different levels so one changed digit gives a visibly different face.

The avatar is a second check for humans, never proof that an address is correct. Always verify the address itself.

Measured with `node packages/core/scripts/grind.mjs` (random addresses):

| Match standard | Expected addresses to generate to match a random victim |
|---|---|
| Strict (every prominent trait equal) | about 3 x 10^17 (roughly 2^58, block-independence estimate) |
| Loose (thumbnail-visible: palette, hue, hair, background, eye count, shape, size, mouth) | about 10^7 (roughly 2^23.5, measured directly) |

Read these honestly. The loose figure is the weak one: a person glancing at a small avatar matches on it. A GPU can generate billions of addresses per second, so the avatar alone does not stop a determined attacker. Its value is that it multiplies the work on top of the usual "match the first and last characters" attack. Use it alongside, not instead of, address checks.
