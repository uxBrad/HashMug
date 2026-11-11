/** How to canonicalize a seed before hashing. */
export type SeedNormalize = "auto" | "ethereum" | "none";

/** Hair edge style. */
export type HairStyle = "wave" | "slope" | "zigzag" | "scallop" | "straight";

export interface AvatarOptions {
  /** Seed canonicalization. Default "auto": Ethereum addresses are lowercased with 0x, other input is trimmed and NFC normalized. */
  normalize?: SeedNormalize;
  /** Output size in px (sets width/height attributes). Omit for scalable (viewBox only). */
  size?: number;
  /** Background corner radius as fraction of size, 0 (square) to 0.5 (circle). Default 0. */
  radius?: number;
  /** Minimum WCAG contrast of eyes and features against the background. Default 3 (non-text UI). */
  minContrast?: number;
  /** Draw a mouth. Default: decided by the seed. */
  mouth?: boolean;
  /** Draw pupils. Default true. */
  pupils?: boolean;
  /** Draw eyebrows. Default: decided by the seed. */
  eyebrows?: boolean;
  /** Hair edge style. Default: chosen by seed. */
  hair?: HairStyle;
  /** Gradient on the top hair band. Default: chosen by seed. */
  gradient?: boolean;
  /** Allow rare variants (gold hair, cyclops, three eyes). Default true. */
  rarity?: boolean;
}
