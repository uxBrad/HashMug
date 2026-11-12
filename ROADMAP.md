# Roadmap

Open work, roughly in order.

- Raise the loose-match class count (thumbnail-visible traits, currently about 2^23.5)
- Cross-environment determinism golden-vector tests
- Canvas helper in core (draw an avatar to a canvas)
- Cloudflare PNG via `@resvg/resvg-wasm`
- OKLCH palette mode
- React and Vue wrappers
- Publish to npm

Done: web component checked in Chrome (2026-11-12). Renders round and square, `label` and `decorative` set the right ARIA, size applies. The module build has a bare `@hashmug/core` import, so plain pages need `dist/index.global.js`.
