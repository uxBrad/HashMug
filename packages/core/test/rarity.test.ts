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
  expect(bgs.size).toBeGreaterThan(N * 0.1);
  expect(ellipses).toBeGreaterThan(N * 0.3);
  expect(rings).toBeGreaterThan(N * 0.05);
});

it("face features stay inside a round crop", () => {
  for (let i = 0; i < 1000; i++) {
    const svg = createAvatar("crop" + i, { style: "face", mouth: true, eyebrows: true });
    for (const m of svg.matchAll(/<circle cx="([\d.-]+)" cy="([\d.-]+)" r="([\d.]+)"/g)) {
      const d = Math.hypot(Number(m[1]) - 50, Number(m[2]) - 50) + Number(m[3]);
      expect(d).toBeLessThanOrEqual(47.5);
    }
    for (const m of svg.matchAll(/<ellipse cx="([\d.-]+)" cy="([\d.-]+)" rx="([\d.]+)" ry="([\d.]+)"/g)) {
      const d = Math.hypot(Number(m[1]) - 50, Number(m[2]) - 50) + Math.min(Number(m[3]), Number(m[4]));
      expect(d).toBeLessThanOrEqual(47.5);
    }
  }
});
