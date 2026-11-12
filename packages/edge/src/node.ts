import { serve } from "@hono/node-server";
import { rasterizeToPng } from "@hashmug/png";
import { createApp } from "./app";

/** Node entry. SVG plus PNG (via @hashmug/png). */
const port = Number(process.env.PORT ?? 8787);
serve({ fetch: createApp({ rasterize: rasterizeToPng }).fetch, port }, () => {
  console.log(`HashMug avatar API on http://localhost:${port}`);
});
