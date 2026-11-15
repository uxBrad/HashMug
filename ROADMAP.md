# Roadmap

Open work, roughly in order.

- OKLCH palette mode
- Publish to npm

Done: web component checked in Chrome (2026-11-12). Renders round and square, `label` and `decorative` set the right ARIA, size applies. The module build has a bare `@hashmug/core` import, so plain pages need `dist/index.global.js`.
Done: loose-match hardening (2026-11-12). Hue 12 to 18 levels, eye size and eye height 3 to 4. Loose is now about 2^25 (was 2^23.4), and a wider glance set that adds hair thickness, eye spacing, brows and mood is about 2^32. Output changed, golden hash re-pinned. Going much higher in loose needs new visible dimensions (new hair or face styles), not more levels.
Done: determinism vectors (2026-11-14). 39 pinned SHA-256 vectors in `packages/core/test/vectors.json` (unicode, empty, long, EIP-55 variants, options). Pass in Node and in Chrome (V8). Not yet run on Safari (JavaScriptCore) or Firefox (SpiderMonkey), the engines most likely to differ in `Math.sin` last digits. Output is rounded to 2 decimals, which hides most of that.
Done: `drawAvatar(canvas | ctx, seed, options)` in core (2026-11-14). Browser only, async, zero deps. Checked in Chrome: round avatars keep transparent corners.
Done: Cloudflare PNG (2026-11-14). `@hashmug/edge` has a `worker-png` entry using `@resvg/resvg-wasm` and `wrangler.png.toml`. Verified in local wrangler/workerd: PNG and SVG both 200. Not deployed.
Done: `@hashmug/react` and `@hashmug/vue` (2026-11-14). Thin `<img>` components, SSR-tested, no effects or DOM access. Not tried in a real React or Vue app yet.
