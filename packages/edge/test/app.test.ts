import { describe, expect, it } from "vitest";
import { rasterizeToPng } from "@hashmug/png";
import { createApp } from "../src/app";

const ADDR = "0xabcdef0123456789abcdef0123456789abcdef01";

describe("edge app", () => {
  const app = createApp();
  const withPng = createApp({ rasterize: rasterizeToPng });

  it("serves SVG with caching and CORS headers", async () => {
    const res = await app.request(`/v1/avatar/${ADDR}.svg?radius=round`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/svg+xml");
    expect(res.headers.get("cache-control")).toContain("immutable");
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect((await res.text()).startsWith("<svg")).toBe(true);
  });
  it("is deterministic and normalizes address case", async () => {
    const a = await (await app.request(`/v1/avatar/${ADDR}.svg`)).text();
    const b = await (await app.request(`/v1/avatar/${ADDR.toUpperCase().replace("0X", "0x")}.svg`)).text();
    expect(a).toBe(b);
  });
  it("treats a path without extension as SVG and keeps dots in seeds", async () => {
    const res = await app.request("/v1/avatar/sam@example.com");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("svg");
  });
  it("rejects bad input", async () => {
    expect((await app.request(`/v1/avatar/x.svg?size=99999`)).status).toBe(400);
    expect((await app.request(`/v1/avatar/x.svg?radius=9`)).status).toBe(400);
    // Trait overrides are not part of the API: ignored, never applied.
    const base = await (await app.request(`/v1/avatar/x.svg`)).text();
    expect(await (await app.request(`/v1/avatar/x.svg?hair=zigzag&mouth=true&rarity=false`)).text()).toBe(base);
    expect((await app.request(`/v1/avatar/${"a".repeat(500)}.svg`)).status).toBe(400);
  });
  it("returns 501 for PNG when no rasterizer is configured", async () => {
    expect((await app.request("/v1/avatar/x.png")).status).toBe(501);
  });
  it("serves PNG when a rasterizer is configured", async () => {
    const res = await withPng.request("/v1/avatar/x.png?size=64");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    const bytes = new Uint8Array(await res.arrayBuffer());
    expect(Array.from(bytes.slice(1, 4))).toEqual([0x50, 0x4e, 0x47]);
  });
});
