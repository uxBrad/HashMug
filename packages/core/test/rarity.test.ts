import { expect, it } from "vitest";
import { createAvatar } from "../src";

it("rare variants appear at roughly the intended rate", () => {
  let cyclops = 0;
  const N = 5000;
  for (let i = 0; i < N; i++) {
    const svg = createAvatar("r" + i, { style: "face", pupils: false });
    if ((svg.match(/<circle/g) ?? []).length === 1) cyclops++;
  }
  expect(cyclops / N).toBeGreaterThan(0.01);
  expect(cyclops / N).toBeLessThan(0.035);
});
