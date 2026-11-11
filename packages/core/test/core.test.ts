import { describe, expect, it } from "vitest";
import { createAvatar, createRng, describeFace, fnv1a, hashSeed, normalizeSeed, sha256, toHex } from "../src";
import { createFaceSvg } from "../src/internal";

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

describe("face avatar", () => {
  it("is deterministic and differs by seed", () => {
    expect(createAvatar("a")).toBe(createAvatar("a"));
    expect(createAvatar("a")).not.toBe(createAvatar("b"));
  });
  it("public options cannot change the face, even if a JS caller passes overrides", () => {
    const base = createAvatar("seed-1");
    const sneaky = createAvatar("seed-1", { mouth: true, hair: "zigzag", rarity: false } as never);
    expect(sneaky).toBe(base);
    expect(createAvatar("seed-1", { radius: 0.5, size: 64 })).not.toBe(base); // presentation differs
    expect(JSON.stringify(describeFace("seed-1", { radius: 0.5 }))).toBe(JSON.stringify(describeFace("seed-1")));
  });
  it("is valid SVG", () => {
    const svg = createAvatar("x", { radius: 0.5 });
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg.endsWith("</svg>")).toBe(true);
  });
  it("eyes stay inside the canvas for 500 seeds", () => {
    for (let i = 0; i < 500; i++) {
      const svg = createFaceSvg("f" + i, { mouth: true }).replace(/<defs>.*?<\/defs>/, "");
      for (const m of svg.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/g)) {
        const [cx, cy, r] = [Number(m[1]), Number(m[2]), Number(m[3])];
        expect(cx - r).toBeGreaterThanOrEqual(0);
        expect(cx + r).toBeLessThanOrEqual(100);
        expect(cy + r).toBeLessThanOrEqual(100);
      }
    }
  });
  it("describeFace returns traits", () => {
    const t = describeFace("brad");
    expect(typeof t.palette).toBe("string");
    expect(t.eyeCount).toBeGreaterThanOrEqual(1);
  });
});

describe("sha256 and normalization", () => {
  const enc = (s: string) => Array.from(new TextEncoder().encode(s));
  it("matches NIST vectors", () => {
    expect(toHex(sha256([]))).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(toHex(sha256(enc("abc")))).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(toHex(sha256(enc("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq")))).toBe(
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
    );
  });
  it("equivalent Ethereum address forms give the same avatar", () => {
    const a = "0xAbCdEf0123456789aBcDeF0123456789AbCdEf01";
    const b = "abcdef0123456789abcdef0123456789abcdef01";
    expect(normalizeSeed(a)).toBe("0x" + b);
    expect(createAvatar(a)).toBe(createAvatar(b));
    expect(createAvatar(a)).toBe(createAvatar(" " + b + " "));
  });
  it("usernames stay case sensitive", () => {
    expect(createAvatar("Brad")).not.toBe(createAvatar("brad"));
  });
  it("one changed hex digit changes the avatar", () => {
    const a = "0xabcdef0123456789abcdef0123456789abcdef01";
    const b = "0xabcdef0123456789abcdef0123456789abcdef02";
    expect(createAvatar(a)).not.toBe(createAvatar(b));
  });
});
