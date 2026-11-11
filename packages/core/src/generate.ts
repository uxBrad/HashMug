import { contrast, ensureContrast, hslToRgb, parseHex, rgbToHex, type RGB } from "./color";
import { hashSeed } from "./hash";
import { createRng } from "./prng";
import type { AvatarModel, AvatarOptions, Cell } from "./types";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const clampInt = (v: number, lo: number, hi: number) => Math.round(clamp(v, lo, hi));

/**
 * Build the abstract avatar (grid + colors) for a seed. Pure and
 * deterministic: same seed and options always give the same model.
 * The order of PRNG draws below is part of the output contract.
 */
export function createModel(seed: string, options: AvatarOptions = {}): AvatarModel {
  const grid = clampInt(options.grid ?? 8, 3, 32);
  const density = clamp(options.density ?? 0.5, 0.05, 0.95);
  const minContrast = options.minContrast ?? 3;
  const rng = createRng(hashSeed(seed));

  // Draw all color randomness first so options never shift the stream.
  const hue = rng.range(0, 360);
  const darkMode = rng.next() < 0.35;
  const sat = rng.range(55, 85);
  const accentShift = rng.range(35, 70) * (rng.next() < 0.5 ? -1 : 1);
  const paletteIdx = rng.next();
  const bgLight = rng.range(88, 95);
  const bgDark = rng.range(10, 18);

  const forced = options.background ? parseHex(options.background) : null;
  let bg: RGB = forced ?? hslToRgb(hue, 20, darkMode ? bgDark : bgLight);

  let c1: RGB;
  let c2: RGB;
  const custom = (options.palette ?? []).map(parseHex).filter((c): c is RGB => c !== null);
  if (custom.length > 0) {
    const i = Math.floor(paletteIdx * custom.length);
    c1 = custom[i] as RGB;
    c2 = custom[(i + 1) % custom.length] as RGB;
    if (!forced) {
      const candidates: RGB[] = [...custom, [255, 255, 255], [17, 17, 17]];
      bg = candidates.reduce((a, b) => (contrast(b, c1) > contrast(a, c1) ? b : a));
    }
  } else {
    c1 = ensureContrast(hue, sat, 50, bg, minContrast);
    c2 = ensureContrast((hue + accentShift + 360) % 360, sat, 55, bg, minContrast);
  }

  // Fill the left half (including the center column) then mirror.
  const half = Math.ceil(grid / 2);
  const cells: Cell[] = [];
  for (let x = 0; x < half; x++) {
    for (let y = 0; y < grid; y++) {
      const on = rng.next() < density;
      const accent = rng.next() < 0.25;
      if (!on) continue;
      const color = accent ? 2 : 1;
      cells.push({ x, y, color });
      const mx = grid - 1 - x;
      if (mx !== x) cells.push({ x: mx, y, color });
    }
  }
  if (cells.length === 0) {
    const mid = Math.floor(grid / 2);
    cells.push({ x: mid, y: mid, color: 1 });
  }

  return { grid, background: rgbToHex(bg), colors: [rgbToHex(c1), rgbToHex(c2)], cells };
}
