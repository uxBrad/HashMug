import { expect, it } from "vitest";
import { createAvatar, sha256, toHex } from "../src";
import vectors from "./vectors.json";

const h = (s: string) => toHex(sha256(Array.from(new TextEncoder().encode(s))));

// Same vectors are checked in a real browser (see README "Determinism").
// A mismatch means the avatar for some seed changed: bump the version, do not just re-pin.
it.each(vectors.map((v, i) => [i, v] as const))("vector %i is stable", (_i, v) => {
  expect(h(createAvatar(v.seed, (v as { options?: object }).options))).toBe(v.sha256);
});

it("EIP-55 case variants share one vector", () => {
  const [a, b] = [vectors[9]!, vectors[10]!];
  expect(a.sha256).toBe(b.sha256);
});
