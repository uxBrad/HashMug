import type { Rng } from "./prng";
import { sha256, toHex, utf8Bytes } from "./sha256";
import type { SeedNormalize } from "./types";

const ETH_ADDRESS = /^(?:0x)?[0-9a-fA-F]{40}$/;

/**
 * Canonicalize a seed so equivalent inputs give the same avatar.
 * "auto" (default): Ethereum-style addresses become lowercase with a 0x
 * prefix (so EIP-55 mixed case never changes the avatar); anything else is
 * only trimmed and Unicode NFC normalized. "none" leaves the input alone.
 */
export function normalizeSeed(seed: string, mode: SeedNormalize = "auto"): string {
  if (mode === "none") return seed;
  const s = seed.trim().normalize("NFC");
  if (mode === "ethereum" || ETH_ADDRESS.test(s)) {
    const hex = s.replace(/^0x/i, "").toLowerCase();
    return "0x" + hex;
  }
  return s;
}

const DOMAIN = "sigil:v1:";

/**
 * Deterministic random stream: SHA-256 over (domain + seed + counter).
 * Every output bit depends on the whole seed, so grinding a similar-looking
 * avatar means grinding a cryptographic hash.
 */
export function createSeedRng(seed: string): Rng {
  const base = utf8Bytes(DOMAIN + seed);
  let counter = 0;
  let words: number[] = [];
  let idx = 8;
  const next = (): number => {
    if (idx >= 8) {
      const block = sha256([...base, (counter >>> 24) & 255, (counter >>> 16) & 255, (counter >>> 8) & 255, counter & 255]);
      counter++;
      words = [];
      for (let i = 0; i < 8; i++) {
        words.push((((block[i * 4] as number) << 24) | ((block[i * 4 + 1] as number) << 16) | ((block[i * 4 + 2] as number) << 8) | (block[i * 4 + 3] as number)) >>> 0);
      }
      idx = 0;
    }
    return (words[idx++] as number) / 4294967296;
  };
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    range: (min, max) => min + next() * (max - min),
    pick: (items) => items[Math.floor(next() * items.length)] as never,
  };
}

/** Short stable id for SVG element ids, derived from the seed. */
export function seedId(seed: string): string {
  return toHex(sha256(utf8Bytes(DOMAIN + "id:" + seed))).slice(0, 8);
}
