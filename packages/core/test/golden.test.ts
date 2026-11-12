import { expect, it } from "vitest";
import { createAvatar, sha256, toHex } from "../src";

const h = (s: string) => toHex(sha256(Array.from(new TextEncoder().encode(s))));

it("output contract is pinned (change only with a deliberate version bump)", () => {
  const seed = "0xabcdef0123456789abcdef0123456789abcdef01";
  expect(h(createAvatar(seed))).toBe("3d4a45bcf119cfe540ebd99971225ee2eb7b7ba42531c6605de060e7096095aa");
});
