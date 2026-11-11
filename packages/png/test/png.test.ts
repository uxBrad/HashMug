import { describe, expect, it } from "vitest";
import { avatarPixels, avatarPng } from "../src";

describe("png export", () => {
  it("produces a valid PNG of the requested size", () => {
    const png = avatarPng("brad", { style: "face" }, 128);
    expect(Array.from(png.slice(0, 8))).toEqual([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const dv = new DataView(png.buffer, png.byteOffset);
    expect(dv.getUint32(16)).toBe(128);
    expect(dv.getUint32(20)).toBe(128);
  });
  it("is deterministic", () => {
    const a = avatarPng("0xabcdef0123456789abcdef0123456789abcdef01", {}, 64);
    const b = avatarPng("0xABCDEF0123456789ABCDEF0123456789ABCDEF01", {}, 64);
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
  });
  it("raw pixels have the right length and a transparent corner when round", () => {
    const img = avatarPixels("brad", { style: "face", radius: 0.5 }, 64);
    expect(img.data.length).toBe(64 * 64 * 4);
    expect(img.data[3]).toBe(0); // top-left alpha
    const mid = (32 * 64 + 32) * 4;
    expect(img.data[mid + 3]).toBe(255);
  });
});
