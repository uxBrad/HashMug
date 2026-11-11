/** Tile shape drawn for each filled cell. */
export type TileShape = "square" | "rounded" | "circle";

/** Visual style. "pixel" is the mirrored block grid, "face" is wavy hair plus eyes. */
export type AvatarStyle = "pixel" | "face";

/** Hair edge style for the face avatar. */
export type HairStyle = "wave" | "slope" | "zigzag" | "scallop" | "straight";

export interface AvatarOptions {
  /** Visual style. Default "pixel". */
  style?: AvatarStyle;
  /** Face style: draw a mouth. Default false. */
  mouth?: boolean;
  /** Face style: draw pupils. Default true. */
  pupils?: boolean;
  /** Face style: draw eyebrows. Default true. */
  eyebrows?: boolean;
  /** Face style: hair edge style. Default: chosen by seed. */
  hair?: HairStyle;
  /** Face style: gradient on the top hair band. Default: chosen by seed. */
  gradient?: boolean;
  /** Face style: allow rare variants (gold hair, cyclops). Default true. */
  rarity?: boolean;
  /** Grid cells per side. Default 8. Mirrored left to right. */
  grid?: number;
  /** Output size in px (sets width/height attributes). Omit for scalable (viewBox only). */
  size?: number;
  /** Fraction of cells filled, 0-1. Default 0.5. */
  density?: number;
  /** Tile shape. Default "square". */
  tile?: TileShape;
  /** Background corner radius as fraction of size, 0 (square) to 0.5 (circle). Default 0. */
  radius?: number;
  /** Padding around the grid as fraction of size, 0-0.4. Default 0.1. */
  padding?: number;
  /** Custom palette of hex colors. Used as-is (contrast is not enforced). */
  palette?: string[];
  /** Force a background color (hex). Generated tile colors are adjusted to keep contrast. */
  background?: string;
  /** Minimum WCAG contrast between tiles and background. Default 3 (non-text UI). */
  minContrast?: number;
}

export interface Cell {
  x: number;
  y: number;
  /** 1 = primary color, 2 = accent color. */
  color: 1 | 2;
}

export interface AvatarModel {
  grid: number;
  background: string;
  colors: [string, string];
  cells: Cell[];
}
