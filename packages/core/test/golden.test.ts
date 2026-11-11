import { expect, it } from "vitest";
import { createAvatar, sha256, toHex } from "../src";

const h = (s: string) => toHex(sha256(Array.from(new TextEncoder().encode(s))));

it("output contract is pinned (change only with a deliberate version bump)", () => {
  const seed = "0xabcdef0123456789abcdef0123456789abcdef01";
  expect(h(createAvatar(seed))).toBe("2b8cc51072b315a93f9279306a449b0f36e560d8dc7adb0d217e990f3fc648fe");
});
