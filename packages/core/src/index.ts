import { describeFace as describeFaceInternal } from "./face";
import { publicOptions } from "./svg";
import type { AvatarOptions } from "./types";

export { createAvatar, createAvatarDataUri } from "./svg";
export { hashSeed, fnv1a } from "./hash";
export { sha256, toHex } from "./sha256";
export { normalizeSeed, createSeedRng } from "./seed";
export { createRng } from "./prng";
export { contrast, parseHex, hslToRgb, rgbToHex, luminance } from "./color";
export type { FaceTraits } from "./face";
export type { SeedNormalize, HairStyle, AvatarOptions } from "./types";
export type { Rng } from "./prng";

/** Human-visible traits of the face for a seed (palette, eyes, hair, and so on). */
export function describeFace(seed: string, options: AvatarOptions = {}) {
  return describeFaceInternal(seed, publicOptions(options));
}
