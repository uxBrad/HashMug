/** How to canonicalize a seed before hashing. */
export type SeedNormalize = "auto" | "ethereum" | "none";

/** Hair edge style. */
export type HairStyle = "wave" | "slope" | "zigzag" | "scallop" | "straight";

/**
 * Public options. These never change which face a seed produces, except
 * `normalize`, which only changes how the seed text is read. The same seed
 * looks the same in every app.
 */
export interface AvatarOptions {
  /** Seed canonicalization. Default "auto": Ethereum addresses are lowercased with 0x, other input is trimmed and NFC normalized. */
  normalize?: SeedNormalize;
  /** Output size in px (sets width/height attributes). Omit for scalable (viewBox only). */
  size?: number;
  /** Background corner radius as fraction of size, 0 (square) to 0.5 (circle). Default 0. */
  radius?: number;
}

/**
 * Trait overrides. INTERNAL: for the sandbox, tests and tooling only.
 * Using these makes a seed look different from the same seed elsewhere,
 * which defeats recognition and the anti-spoofing goal. Import from
 * "@hashmug/core/internal".
 */
export interface FaceOverrides extends AvatarOptions {
  /** Minimum WCAG contrast of eyes and features against the background. Default 3. */
  minContrast?: number;
  mouth?: boolean;
  pupils?: boolean;
  eyebrows?: boolean;
  hair?: HairStyle;
  gradient?: boolean;
  /** Allow rare variants (gold hair, cyclops, three eyes). Default true. */
  rarity?: boolean;
}
