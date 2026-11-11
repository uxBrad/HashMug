/** RGB triple, each channel 0-255. */
export type RGB = [number, number, number];

/** Convert HSL (h 0-360, s/l 0-100) to RGB. */
export function hslToRgb(h: number, s: number, l: number): RGB {
  const sat = s / 100;
  const lig = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

export function rgbToHex([r, g, b]: RGB): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** Parse #rgb or #rrggbb. Returns null if invalid. */
export function parseHex(hex: string): RGB | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1] as string;
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** WCAG 2.x relative luminance. */
export function luminance([r, g, b]: RGB): number {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }) as RGB;
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

/** WCAG contrast ratio, 1 to 21. */
export function contrast(a: RGB, b: RGB): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Nudge lightness of an HSL color away from `bg` until it reaches
 * `minContrast`. Steps are deterministic, so output is stable.
 */
export function ensureContrast(h: number, s: number, l: number, bg: RGB, minContrast: number): RGB {
  const goDarker = luminance(bg) > 0.4;
  let light = l;
  let rgb = hslToRgb(h, s, light);
  while (contrast(rgb, bg) < minContrast && light > 0 && light < 100) {
    light += goDarker ? -2 : 2;
    rgb = hslToRgb(h, s, Math.max(0, Math.min(100, light)));
  }
  return rgb;
}
