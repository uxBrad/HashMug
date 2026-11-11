import { ensureContrast, hslToRgb, rgbToHex, type RGB } from "./color";
import { hashSeed } from "./hash";
import { createRng } from "./prng";
import type { AvatarOptions, HairStyle } from "./types";

const V = 100;
const STEPS = 12;
const HAIR_STYLES: HairStyle[] = ["wave", "slope", "zigzag", "scallop", "straight"];
const num = (n: number) => String(Math.round(n * 100) / 100);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
type Pt = [number, number];

interface HairParams {
  base: number;
  gap: number;
  f1: number;
  f2: number;
  a1: number;
  a2: number;
  p1: number;
  p2: number;
  tilt: number; // slope / straight tilt
  zig: number; // zigzag segments
  zigAmp: number;
  bump: number; // scallop depth
  scal: number; // scallop count
}

/** Closed region from the top edge down to one hair edge. Index i is the band. */
function hairEdge(style: HairStyle, h: HairParams, i: number): { d: string; maxY: number } {
  const by = h.base + h.gap * i;
  const head = (y: number) => `M0 0H${V}V${num(y)}`;
  const smooth = (pts: Pt[]) => {
    const n = pts.length - 1;
    let d = head((pts[n] as Pt)[1]);
    let maxY = 0;
    for (const p of pts) maxY = Math.max(maxY, p[1]);
    for (let k = n; k > 0; k--) {
      const [x0, y0] = pts[k] as Pt;
      const [x1, y1] = pts[k - 1] as Pt;
      const mx = (x0 + x1) / 2;
      const my = (y0 + y1) / 2;
      d += k === n ? `L${num(mx)} ${num(my)}` : `Q${num(x0)} ${num(y0)} ${num(mx)} ${num(my)}`;
    }
    return { d: d + `L0 ${num((pts[0] as Pt)[1])}Z`, maxY };
  };
  const poly = (pts: Pt[]) => {
    const n = pts.length - 1;
    let d = head((pts[n] as Pt)[1]);
    let maxY = 0;
    for (const p of pts) maxY = Math.max(maxY, p[1]);
    for (let k = n - 1; k >= 0; k--) d += `L${num((pts[k] as Pt)[0])} ${num((pts[k] as Pt)[1])}`;
    return { d: d + "Z", maxY };
  };
  const shift = i * 0.35;

  if (style === "wave" || style === "slope") {
    const pts: Pt[] = [];
    for (let k = 0; k <= STEPS; k++) {
      const x = (V / STEPS) * k;
      let y = by + h.a1 * Math.sin(x * h.f1 + h.p1 + shift) + h.a2 * Math.sin(x * h.f2 + h.p2 + shift);
      if (style === "slope") y = by + (h.tilt * (x - 50)) / 50 + (y - by) * 0.4;
      pts.push([x, y]);
    }
    return smooth(pts);
  }
  if (style === "zigzag") {
    const pts: Pt[] = [];
    for (let k = 0; k <= h.zig; k++) pts.push([(V / h.zig) * k, by + ((k + i) % 2 ? h.zigAmp : -h.zigAmp)]);
    return poly(pts);
  }
  if (style === "straight") {
    return poly([
      [0, by + h.tilt * 0.4],
      [V, by - h.tilt * 0.4],
    ]);
  }
  // scallop: round bumps hanging down
  const n = h.scal;
  let d = head(by);
  for (let k = n; k > 0; k--) {
    const x0 = (V / n) * k;
    const x1 = (V / n) * (k - 1);
    d += `Q${num((x0 + x1) / 2)} ${num(by + h.bump * 2)} ${num(x1)} ${num(by)}`;
  }
  return { d: d + "Z", maxY: by + h.bump };
}

interface Eye {
  x: number;
  y: number;
  r: number;
  color: RGB;
  /** -1 inner end is on the right (left eye), 1 inner end is on the left (right eye), 0 centered. */
  side: -1 | 0 | 1;
}

/**
 * Face avatar: layered hair bands in one of five edge styles, round eyes with
 * independent size and spacing, optional pupils, eyebrows and mouth.
 * Rare seeds get gold hair (6%) or a single cyclops eye (2%).
 * The order of PRNG draws is part of the output contract.
 */
export function createFaceSvg(seed: string, options: AvatarOptions = {}): string {
  const rng = createRng(hashSeed(seed));
  const minContrast = options.minContrast ?? 3;
  const radius = clamp(options.radius ?? 0, 0, 0.5);
  const showPupils = options.pupils ?? true;
  const showBrows = options.eyebrows ?? true;
  const useRarity = options.rarity ?? true;

  // All draws happen unconditionally, in this order.
  const rarityRoll = rng.next();
  const hue0 = rng.range(0, 360);
  const accentOff = rng.range(70, 200);
  const skinHue = rng.range(0, 360);
  const skinSat = rng.range(0, 45);
  const skinL = rng.range(83, 92);
  const hairSat = rng.range(70, 92);
  const lA = rng.range(48, 62);
  const lAcc = rng.range(45, 55);
  const gradRoll = rng.next();
  const styleIdx = rng.int(0, HAIR_STYLES.length - 1);
  const h: HairParams = {
    base: rng.range(20, 32),
    gap: rng.range(7, 12),
    f1: rng.range(0.07, 0.16),
    f2: 0,
    a1: rng.range(2, 7),
    a2: rng.range(0.5, 3),
    p1: rng.range(0, 6.28),
    p2: rng.range(0, 6.28),
    tilt: rng.range(-12, 12),
    zig: rng.int(6, 10),
    zigAmp: rng.range(2.5, 5),
    bump: rng.range(3, 6),
    scal: rng.int(4, 7),
  };
  h.f2 = h.f1 * rng.range(1.8, 2.6);
  const r1 = rng.range(5, 11);
  const r2 = rng.range(5, 11);
  const gapX = rng.range(24, 56);
  const centerX = 50 + rng.range(-6, 6);
  const eyeLow = rng.range(0, 10);
  const j1 = rng.range(-2, 2);
  const j2 = rng.range(-2, 2);
  const c1Pick = rng.next() < 0.5;
  const c2Pick = rng.next() < 0.5;
  const pupilScale = rng.range(0.35, 0.55);
  const lookAngle = rng.range(0, 6.28);
  const lookAmt = rng.range(0, 0.3);
  const mood = rng.range(-1, 1);
  const lift1 = rng.range(0, 3);
  const lift2 = rng.range(0, 3);
  const mouthGap = rng.range(6, 12);
  const mouthW = rng.range(8, 18);
  const mouthKind = rng.int(0, 2);

  const tier = !useRarity ? "common" : rarityRoll < 0.02 ? "legendary" : rarityRoll < 0.08 ? "rare" : "common";
  const style: HairStyle = options.hair ?? (HAIR_STYLES[styleIdx] as HairStyle);
  const gradient = options.gradient ?? (tier === "rare" || gradRoll < 0.4);

  // Colors.
  const bg: RGB = hslToRgb(skinHue, skinSat, skinL);
  const hue = tier === "rare" ? 45 : hue0;
  const hairA = ensureContrast(hue, hairSat, lA, bg, minContrast);
  const hairB = ensureContrast(hue, hairSat, 36, bg, minContrast + 1);
  const accent = ensureContrast((hue0 + accentOff) % 360, hairSat, lAcc, bg, minContrast);
  const hairTop = ensureContrast((hue + (tier === "rare" ? 12 : 40)) % 360, hairSat, lA + 6, bg, minContrast);
  const pupil = hslToRgb(hue0, 45, 14);

  // Geometry.
  const e1 = hairEdge(style, h, 0);
  const e2 = hairEdge(style, h, 1);
  const e3 = hairEdge(style, h, 2);
  const top = e3.maxY + (showBrows ? 10 : 6);
  const eyes: Eye[] = [];
  if (tier === "legendary") {
    const r = Math.max(r1, r2) + 4;
    eyes.push({ x: centerX, y: clamp(top + r + eyeLow, top + r, 86 - r), r, color: c1Pick ? hairA : accent, side: 0 });
  } else {
    const x1 = clamp(centerX - gapX / 2, r1 + 6, 94 - r1);
    const x2 = clamp(centerX + gapX / 2, r2 + 6, 94 - r2);
    eyes.push({ x: x1, y: clamp(top + r1 + eyeLow + j1, top + r1, 88 - r1), r: r1, color: c1Pick ? hairA : accent, side: -1 });
    eyes.push({ x: x2, y: clamp(top + r2 + eyeLow + j2, top + r2, 88 - r2), r: r2, color: c2Pick ? hairA : accent, side: 1 });
  }

  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${V} ${V}"`;
  out += options.size ? ` width="${options.size}" height="${options.size}"` : "";
  out += ` role="img" aria-label="Avatar">`;

  const uid = hashSeed(seed).toString(36);
  const defs: string[] = [];
  if (radius > 0) defs.push(`<clipPath id="c${uid}"><rect width="${V}" height="${V}" rx="${num(radius * V)}"/></clipPath>`);
  if (gradient) {
    defs.push(
      `<linearGradient id="g${uid}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${num(h.base + 6)}">` +
        `<stop offset="0" stop-color="${rgbToHex(hairTop)}"/><stop offset="1" stop-color="${rgbToHex(hairA)}"/></linearGradient>`,
    );
  }
  if (defs.length) out += `<defs>${defs.join("")}</defs>`;
  out += `<g${radius > 0 ? ` clip-path="url(#c${uid})"` : ""}><rect width="${V}" height="${V}" fill="${rgbToHex(bg)}"/>`;
  out += `<path fill="${rgbToHex(accent)}" d="${e3.d}"/>`;
  out += `<path fill="${rgbToHex(hairB)}" d="${e2.d}"/>`;
  out += `<path fill="${gradient ? `url(#g${uid})` : rgbToHex(hairA)}" d="${e1.d}"/>`;

  const lookX = Math.cos(lookAngle) * lookAmt;
  const lookY = Math.sin(lookAngle) * lookAmt;
  for (const e of eyes) {
    out += `<circle cx="${num(e.x)}" cy="${num(e.y)}" r="${num(e.r)}" fill="${rgbToHex(e.color)}"/>`;
    if (showPupils) {
      out += `<circle cx="${num(e.x + lookX * e.r)}" cy="${num(e.y + lookY * e.r)}" r="${num(e.r * pupilScale)}" fill="${rgbToHex(pupil)}"/>`;
    }
  }
  if (showBrows) {
    const stroke = rgbToHex(hairB);
    eyes.forEach((e, idx) => {
      const lift = idx === 0 ? lift1 : lift2;
      const by = e.y - e.r - 4 - lift;
      const half = e.r * (e.side === 0 ? 1 : 0.85);
      const t = e.side === 0 ? 0 : mood * 3.5; // positive = angry (inner end lower)
      // left eye: inner end is its right end; right eye: inner end is its left end
      const yl = e.side === 1 ? by + t : by - t;
      const yr = e.side === 1 ? by - t : by + t;
      out += `<path d="M${num(e.x - half)} ${num(yl)}L${num(e.x + half)} ${num(yr)}" stroke="${stroke}" stroke-width="2.6" stroke-linecap="round"/>`;
    });
  }
  if (options.mouth) {
    const lowest = Math.max(...eyes.map((e) => e.y + e.r));
    const my = clamp(lowest + mouthGap, 0, 93);
    const mx = eyes.reduce((s, e) => s + e.x, 0) / eyes.length;
    const stroke = rgbToHex(hairB);
    if (mouthKind === 0) {
      out += `<path d="M${num(mx - mouthW)} ${num(my)}Q${num(mx)} ${num(my + mouthW * 0.8)} ${num(mx + mouthW)} ${num(my)}" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>`;
    } else if (mouthKind === 1) {
      out += `<path d="M${num(mx - mouthW)} ${num(my)}H${num(mx + mouthW)}" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/>`;
    } else {
      out += `<circle cx="${num(mx)}" cy="${num(my)}" r="${num(mouthW / 3)}" fill="${stroke}"/>`;
    }
  }
  return out + `</g></svg>`;
}
