import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { expect, it } from "vitest";
import { createAvatar } from "@hashmug/core";
import { createApp } from "../src/app";
import { createWasmRasterizer } from "../src/wasm-png";

const wasmPath = createRequire(import.meta.url).resolve("@resvg/resvg-wasm/index_bg.wasm");

it("wasm rasterizer serves a PNG of the requested size", async () => {
  const app = createApp({ rasterize: createWasmRasterizer(readFileSync(wasmPath)) });
  const res = await app.request("/v1/avatar/uxbrad.eth.png?size=64&radius=round");
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toBe("image/png");
  const b = new Uint8Array(await res.arrayBuffer());
  expect(Array.from(b.slice(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  const dv = new DataView(b.buffer, b.byteOffset);
  expect([dv.getUint32(16), dv.getUint32(20)]).toEqual([64, 64]);
});

it("wasm rasterizer can be called directly and reuses one init", async () => {
  const r = createWasmRasterizer(readFileSync(wasmPath));
  const [a, b] = await Promise.all([r(createAvatar("a"), 32), r(createAvatar("b"), 32)]);
  expect(a.length).toBeGreaterThan(100);
  expect(a).not.toEqual(b);
});
