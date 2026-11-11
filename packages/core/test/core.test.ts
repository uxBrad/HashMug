import { describe, expect, it } from "vitest";
import { contrast, createAvatar, createModel, createRng, fnv1a, hashSeed, parseHex } from "../src";

describe("hash and prng", () => {
  it("fnv1a matches known vectors", () => {
    expect(fnv1a("")).toBe(0x811c9dc5);
    expect(fnv1a("a")).toBe(0xe40c292c);
    expect(fnv1a("foobar")).toBe(0xbf9cf968);
  });
  it("hashSeed is stable and sensitive", () => {
    expect(hashSeed("brad")).toBe(hashSeed("brad"));
    expect(hashSeed("brad")).not.toBe(hashSeed("brae"));
  });
  it("same seed gives same rng stream", () => {
    const a = createRng(1);
    const b = createRng(1);
    expect([a.next(), a.next()]).toEqual([b.next(), b.next()]);
  });
});

describe("avatar", () => {
  it("is deterministic", () => {
    expect(createAvatar("0xabc")).toBe(createAvatar("0xabc"));
    expect(createAvatar("a")).not.toBe(createAvatar("b"));
  });
  it("is horizontally symmetric", () => {
    const m = createModel("symmetry", { grid: 8 });
    const set = new Set(m.cells.map((c) => `${c.x},${c.y},${c.color}`));
    for (const c of m.cells) expect(set.has(`${7 - c.x},${c.y},${c.color}`)).toBe(true);
  });
  it("keeps contrast for 500 seeds", () => {
    for (let i = 0; i < 500; i++) {
      const m = createModel("seed" + i);
      const bg = parseHex(m.background) as [number, number, number];
      for (const c of m.colors) {
        expect(contrast(parseHex(c) as [number, number, number], bg)).toBeGreaterThanOrEqual(3);
      }
    }
  });
  it("never empty and valid svg", () => {
    const svg = createAvatar("x", { density: 0.05, tile: "circle", radius: 0.5 });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg.endsWith("</svg>")).toBe(true);
    expect(createModel("x", { density: 0.05 }).cells.length).toBeGreaterThan(0);
  });
  it("grid option does not change the colors", () => {
    expect(createModel("s", { grid: 5 }).colors).toEqual(createModel("s", { grid: 8 }).colors);
  });
});
