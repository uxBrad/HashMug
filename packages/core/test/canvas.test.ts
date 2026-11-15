import { afterEach, expect, it, vi } from "vitest";
import { drawAvatar } from "../src";

afterEach(() => vi.unstubAllGlobals());

function fakeEnv() {
  let svgText = "";
  vi.stubGlobal("Blob", class { constructor(public parts: string[]) { svgText = parts[0] as string; } });
  vi.stubGlobal("URL", { createObjectURL: () => "blob:x", revokeObjectURL: vi.fn() });
  vi.stubGlobal("Image", class { decoding = ""; src = ""; decode() { return Promise.resolve(); } });
  const ctx = { canvas: { width: 80 }, clearRect: vi.fn(), drawImage: vi.fn() };
  return { ctx, svg: () => svgText };
}

it("draws a sized avatar into a 2d context", async () => {
  const { ctx, svg } = fakeEnv();
  await drawAvatar(ctx as never, "uxbrad.eth", { radius: 0.5 });
  expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 80, 80);
  expect(ctx.drawImage).toHaveBeenCalledTimes(1);
  expect(svg()).toContain('width="80" height="80"');
});

it("accepts a canvas element and an explicit size", async () => {
  const { ctx, svg } = fakeEnv();
  const canvas = { getContext: () => ctx };
  await drawAvatar(canvas as never, "a", { size: 32 });
  expect(ctx.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 32, 32);
  expect(svg()).toContain('width="32" height="32"');
});
