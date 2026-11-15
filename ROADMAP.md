# Roadmap

Open work, roughly in order.

- Canvas helper in core (draw an avatar to a canvas)
- Cloudflare PNG via `@resvg/resvg-wasm`
- OKLCH palette mode
- React and Vue wrappers
- Publish to npm

Done: web component checked in Chrome (2026-11-12). Renders round and square, `label` and `decorative` set the right ARIA, size applies. The module build has a bare `@hashmug/core` import, so plain pages need `dist/index.global.js`.
Done: loose-match hardening (2026-11-12). Hue 12 to 18 levels, eye size and eye height 3 to 4. Loose is now about 2^25 (was 2^23.4), and a wider glance set that adds hair thickness, eye spacing, brows and mood is about 2^32. Output changed, golden hash re-pinned. Going much higher in loose needs new visible dimensions (new hair or face styles), not more levels.
Done: determinism vectors (2026-11-14). 39 pinned SHA-256 vectors in `packages/core/test/vectors.json` (unicode, empty, long, EIP-55 variants, options). Pass in Node and in Chrome (V8). Not yet run on Safari (JavaScriptCore) or Firefox (SpiderMonkey), the engines most likely to differ in `Math.sin` last digits. Output is rounded to 2 decimals, which hides most of that.
