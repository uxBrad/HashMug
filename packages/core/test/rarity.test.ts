import { expect, it } from "vitest";
import { createAvatar } from "../src";

it("faces are highly varied", () => {
  const N = 2000;
  const seen = new Set<string>();
  const bgs = new Set<string>();
  let ellipses = 0;
  let rings = 0;
  for (let i = 0; i < N; i++) {
    const svg = createAvatar("v" + i, { style: "face" });
    seen.add(svg);
    bgs.add((/fill="(#[0-9a-f]{6})"/.exec(svg) ?? [])[1] ?? "");
    if (svg.includes("<ellipse")) ellipses++;
    if (svg.includes("fill=\"none\" stroke")) rings++;
  }
  expect(seen.size).toBe(N);
  expect(bgs.size).toBeGreaterThan(N * 0.4);
  expect(ellipses).toBeGreaterThan(N * 0.3);
  expect(rings).toBeGreaterThan(N * 0.05);
});
