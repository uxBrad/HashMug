# Roadmap

Open work, roughly in order.


Done: web component checked in Chrome (2026-11-12). Renders round and square, `label` and `decorative` set the right ARIA, size applies. Both `dist/index.js` and `dist/index.global.js` are self-contained (core is bundled in). A script `src` needs a real path, not the bare package name.
Done: loose-match hardening (2026-11-12). Hue 12 to 18 levels, eye size and eye height 3 to 4. Loose is now about 2^25 (was 2^23.4), and a wider glance set that adds hair thickness, eye spacing, brows and mood is about 2^32. Output changed, golden hash re-pinned. Going much higher in loose needs new visible dimensions (new hair or face styles), not more levels.
Done: determinism vectors (2026-11-14). 39 pinned SHA-256 vectors in `packages/core/test/vectors.json` (unicode, empty, long, EIP-55 variants, options). Pass in Node and in Chrome (V8). Not yet run on Safari (JavaScriptCore) or Firefox (SpiderMonkey), the engines most likely to differ in `Math.sin` last digits. Output is rounded to 2 decimals, which hides most of that.
Done: `drawAvatar(canvas | ctx, seed, options)` in core (2026-11-14). Browser only, async, zero deps. Checked in Chrome: round avatars keep transparent corners.
Done: Cloudflare PNG (2026-11-14). `@hashmug/edge` has a `worker-png` entry using `@resvg/resvg-wasm` and `wrangler.png.toml`. Verified in local wrangler/workerd: PNG and SVG both 200. Not deployed.
Done: `@hashmug/react` and `@hashmug/vue` (2026-11-14). Thin `<img>` components, SSR-tested, no effects or DOM access. Not tried in a real React or Vue app yet.
Dropped: OKLCH palette mode. It contradicts the one-face-per-seed rule (a mode switch lets apps change the face) and as an internal rewrite it only shifts colors for everyone. Revisit only as a deliberate v2 look.
Publish prep done (2026-11-14): MIT LICENSE, package metadata, README in each package, `pnpm pack` clean for all six. Not published: needs `npm login`.
Done: published 0.1.0 of all six packages to npm under the @hashmug scope (2026-11-17). Fresh install from the registry reproduces the golden hash. Known gap: 0.1.0 of @hashmug/edge omits wrangler.png.toml (fixed in source, ships with the next version).
