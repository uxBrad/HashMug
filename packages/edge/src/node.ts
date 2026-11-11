import { serve } from "@hono/node-server";
import { rasterizeToPng } from "@sigil/png";
import { createApp } from "./app";

/** Node entry. SVG plus PNG (via @sigil/png). */
const port = Number(process.env.PORT ?? 8787);
serve({ fetch: createApp({ rasterize: rasterizeToPng }).fetch, port }, () => {
  console.log(`Sigil avatar API on http://localhost:${port}`);
});
