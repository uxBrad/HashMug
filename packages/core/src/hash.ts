import { utf8Bytes } from "./sha256";

/**
 * Legacy 32-bit hashing (FNV-1a). Not used by the avatar engine, which uses
 * SHA-256 (see seed.ts). Kept for utilities and tests.
 * Integer math only (Math.imul, >>> 0) so every language
 * can port it bit for bit. Changing this changes every avatar.
 */

/** FNV-1a 32-bit over the UTF-8 bytes of `str`. */
export function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (const byte of utf8Bytes(str)) {
    h ^= byte;
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Turn a string into a well-mixed 32-bit seed. FNV-1a alone has weak
 * avalanche on short inputs, so finish with a murmur3-style mixer.
 */
export function hashSeed(str: string): number {
  let h = fnv1a(str);
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}
