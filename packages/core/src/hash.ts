/**
 * Seed hashing. Integer math only (Math.imul, >>> 0) so every language
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

/** UTF-8 encode without TextEncoder so it runs in any JS engine. */
function utf8Bytes(str: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
      const d = str.charCodeAt(i + 1);
      if (d >= 0xdc00 && d <= 0xdfff) {
        c = 0x10000 + ((c - 0xd800) << 10) + (d - 0xdc00);
        i++;
      }
    }
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return out;
}
