import { createAvatar } from "@sigil/core";
import { Hono } from "hono";
import { MAX_SEED_LENGTH, ParamError, parseOptions } from "./params";

export interface AppOptions {
  /**
   * Turns an SVG into PNG bytes. When omitted, `.png` requests return 501 and
   * only SVG is served (this keeps the Worker free of native code). Node
   * entry wires in `@sigil/png`.
   */
  rasterize?: (svg: string, size: number) => Uint8Array | Promise<Uint8Array>;
  /** Cache-Control for avatar responses. Default: one year, immutable. */
  cacheControl?: string;
}

const USAGE = `Sigil avatar API

GET /v1/avatar/{seed}.svg
GET /v1/avatar/{seed}.png   (when enabled)

Query: size=16..1024  radius=0..0.5|round
The face itself is fixed by the seed. No option changes it.

Example: <img src="/v1/avatar/0xabc....svg?radius=round" width="64" height="64" alt="">
`;

/** Build the Hono app. Runtime-agnostic: no Node or Workers APIs are used here. */
export function createApp(opts: AppOptions = {}): Hono {
  const app = new Hono();
  const cache = opts.cacheControl ?? "public, max-age=31536000, immutable";

  app.use("*", async (c, next) => {
    await next();
    c.header("Access-Control-Allow-Origin", "*");
    c.header("X-Content-Type-Options", "nosniff");
  });

  app.get("/", (c) => c.text(USAGE));
  app.get("/health", (c) => c.json({ ok: true }));

  app.get("/v1/avatar/:file", async (c) => {
    let seed = c.req.param("file");
    let ext: "svg" | "png" = "svg";
    if (seed.endsWith(".png")) {
      ext = "png";
      seed = seed.slice(0, -4);
    } else if (seed.endsWith(".svg")) {
      seed = seed.slice(0, -4);
    }
    if (seed.length === 0) return c.text("seed is required", 400);
    if (seed.length > MAX_SEED_LENGTH) return c.text(`seed must be at most ${MAX_SEED_LENGTH} characters`, 400);

    let parsed;
    try {
      parsed = parseOptions(new URL(c.req.url).searchParams);
    } catch (e) {
      if (e instanceof ParamError) return c.text(e.message, 400);
      throw e;
    }

    const { options, size } = parsed;
    if (ext === "png") {
      if (!opts.rasterize) return c.text("PNG output is not enabled on this server. Use .svg.", 501);
      const png = await opts.rasterize(createAvatar(seed, options), size ?? 256);
      return c.body(png as unknown as ArrayBuffer, 200, { "Content-Type": "image/png", "Cache-Control": cache });
    }
    const svg = createAvatar(seed, size ? { ...options, size } : options);
    return c.body(svg, 200, { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": cache });
  });

  return app;
}
