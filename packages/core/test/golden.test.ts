import { expect, it } from "vitest";
import { createAvatar, sha256, toHex } from "../src";

const h = (s: string) => toHex(sha256(Array.from(new TextEncoder().encode(s))));

it("output contract is pinned (change only with a deliberate version bump)", () => {
  const seed = "0xabcdef0123456789abcdef0123456789abcdef01";
  expect(h(createAvatar(seed))).toBe("8b84f4d83dcd901e43bee6adde750f5417d77bc6b741048ef7ddb20770f68b57");
});
