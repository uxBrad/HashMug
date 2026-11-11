import { contrast, ensureContrast, hslToRgb, rgbToHex, type RGB } from "./color";
import { createSeedRng, normalizeSeed, seedId } from "./seed";
import type { AvatarOptions, HairStyle } from "./types";

const V = 100;
const STEPS = 12;
const HAIR_STYLES: HairStyle[] = ["wave", "slope", "zigzag", "scallop", "straight"];
const num = (n: number) => String(Math.round(n * 100) / 100);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
type Pt = [number, number];
type HSL = [number, number, number];

const rgbOf = ([h, s, l]: HSL): RGB => hslToRgb(((h % 360) + 360) % 360, clamp(s, 0, 100), clamp(l, 0, 100));
const hex = (c: RGB) => rgbToHex(c);

interface HairParams {
  f1: number;
  f2: number;
  a1: number;
  a2: number;
  p1: number;
  p2: number;
  tilt: number;
  zig: number;
  zigAmp: number;
  bump: number;
  scal: number;
}

/** Closed region from far above the canvas down to one hair edge at depth `by`. */
function hairEdge(style: HairStyle, h: HairParams, by: number, shift: number, alt: number): { d: string; maxY: number } {
  const head = (y: number) => `M-60 -60H160V${num(y)}L${V} ${num(y)}`;
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
    const y0 = (pts[0] as Pt)[1];
    return { d: d + `L0 ${num(y0)}L-60 ${num(y0)}Z`, maxY };
  };
  const poly = (pts: Pt[]) => {
    const n = pts.length - 1;
    let d = head((pts[n] as Pt)[1]);
    let maxY = 0;
    for (const p of pts) maxY = Math.max(maxY, p[1]);
    for (let k = n - 1; k >= 0; k--) d += `L${num((pts[k] as Pt)[0])} ${num((pts[k] as Pt)[1])}`;
    return { d: d + `L-60 ${num((pts[0] as Pt)[1])}Z`, maxY };
  };

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
    for (let k = 0; k <= h.zig; k++) pts.push([(V / h.zig) * k, by + ((k + alt) % 2 ? h.zigAmp : -h.zigAmp)]);
    return poly(pts);
  }
  if (style === "straight") {
    return poly([
      [0, by + h.tilt * 0.4],
      [V, by - h.tilt * 0.4],
    ]);
  }
  let d = head(by) + `L${V} ${num(by)}`;
  for (let k = h.scal; k > 0; k--) {
    const x0 = (V / h.scal) * k;
    const x1 = (V / h.scal) * (k - 1);
    d += `Q${num((x0 + x1) / 2)} ${num(by + h.bump * 2)} ${num(x1)} ${num(by)}`;
  }
  return { d: d + `L-60 ${num(by)}Z`, maxY: by + h.bump };
}

interface Palette {
  bg: HSL;
  bg2: HSL;
  hair: HSL[]; // 4 band colors
  eyes: HSL[]; // 2 eye colors
  ink: HSL; // brows, nose, mouth
}

const MODES = ["pastel", "neon", "earthy", "mono", "duo", "bold", "ink", "triad"] as const;

function makePalette(mode: string, h: number, h2: number, h3: number, v: number, pv: number[]): Palette {
  switch (mode) {
    case "pastel": {
      // Independent hues, saturations and lightnesses per band so pastels differ a lot.
      const bgH = h + h3 * (pv[0] as number);
      const bgS = 25 + (pv[1] as number) * 55;
      const bgL = 84 + (pv[2] as number) * 11;
      const sat = 45 + (pv[3] as number) * 40;
      const hues = [h, h + h2 * (0.4 + (pv[4] as number)), h - h3 * (0.3 + (pv[5] as number)), h2 + h3];
      const ls = [60 + (pv[6] as number) * 16, 52 + (pv[7] as number) * 18, 64 + (pv[8] as number) * 12, 56 + (pv[9] as number) * 16];
      return {
        bg: [bgH, bgS, bgL],
        bg2: [bgH + 25 + (pv[0] as number) * 50, bgS, bgL - 5],
        hair: hues.map((hh, i) => [hh, sat - i * 4, ls[i] as number] as HSL),
        eyes: [[hues[1] as number, sat, 36], [hues[2] as number, sat, 34]],
        ink: [bgH, 35, 24],
      };
    }
    case "neon":
      return { bg: [h, 35, 9], bg2: [h2, 45, 14], hair: [[h, 100, 60], [h2, 100, 55], [h3, 100, 62], [h + 30, 100, 66]], eyes: [[h2, 100, 62], [h3, 100, 62]], ink: [h, 100, 78] };
    case "earthy": {
      const e = 15 + v * 40;
      return { bg: [e + 10, 32, 86], bg2: [e + 30, 30, 80], hair: [[e, 45, 38], [e + 25, 40, 50], [e + 110, 32, 40], [e - 15, 50, 28]], eyes: [[e + 110, 40, 28], [e, 50, 28]], ink: [e, 45, 18] };
    }
    case "mono":
      return { bg: [h, 38, 88], bg2: [h, 30, 80], hair: [[h, 75, 50], [h, 70, 34], [h, 60, 66], [h, 50, 24]], eyes: [[h, 80, 36], [h, 80, 30]], ink: [h, 60, 14] };
    case "duo":
      return { bg: [h, 60, 90], bg2: [h2, 50, 84], hair: [[h2, 80, 50], [h2, 80, 34], [h, 80, 55], [h2, 70, 70]], eyes: [[h2, 80, 42], [h, 80, 42]], ink: [h2, 80, 18] };
    case "bold":
      return { bg: [h, 85, 55], bg2: [h2, 85, 50], hair: [[h2, 90, 18], [h2, 80, 94], [h3, 90, 72], [h, 70, 24]], eyes: [[h2, 90, 96], [h3, 90, 16]], ink: [h2, 80, 10] };
    case "ink":
      return { bg: [h, 0, 92], bg2: [h, 6, 84], hair: [[0, 0, 15], [0, 0, 35], [h, 90, 55], [0, 0, 60]], eyes: [[0, 0, 10], [h, 90, 48]], ink: [0, 0, 10] };
    case "gold":
      return { bg: [h, 28, 12], bg2: [h2, 32, 18], hair: [[45, 95, 56], [40, 90, 40], [50, 100, 72], [35, 80, 30]], eyes: [[h2, 85, 72], [45, 95, 60]], ink: [45, 90, 70] };
    default:
      return { bg: [h, 42, 92], bg2: [h2, 38, 86], hair: [[h, 80, 55], [h2, 80, 50], [h3, 80, 55], [h, 60, 30]], eyes: [[h2, 80, 40], [h3, 80, 40]], ink: [h, 70, 22] };
  }
}

/** Features must sit inside this radius so round crops never cut them. */
const SAFE_R = 46;
const insideCircle = (pts: Pt[]) => pts.every(([x, y]) => Math.hypot(x - 50, y - 50) <= SAFE_R);
/** Nudge (x, y) toward the center until every point from `pts` is inside the safe circle. */
function pull(x: number, y: number, pts: (x: number, y: number) => Pt[]): Pt {
  for (let i = 0; i < 60 && !insideCircle(pts(x, y)); i++) {
    const dx = 50 - x;
    const dy = 50 - y;
    const d = Math.hypot(dx, dy);
    if (d < 1) break;
    x += dx / d;
    y += dy / d;
  }
  return [x, y];
}
/** Discrete, human-visible traits of a face avatar. */
export interface FaceTraits {
  tier: string;
  palette: string;
  hue: number;
  orientation: number;
  tilt: number;
  bands: number;
  hairStyle: string;
  mixedHair: boolean;
  hairDepth: number;
  gradient: boolean;
  background: string;
  eyeCount: number;
  eyeShapes: string;
  eyeSize: number;
  eyeSpacing: number;
  eyeHeight: number;
  brows: number;
  mood: number;
  mouth: number;
  nose: number;
}

/** Face avatar SVG for a seed. */
export function createFaceSvg(seed: string, options: AvatarOptions = {}): string {
  return buildFace(seed, options).svg;
}

/** Traits of the face avatar for a seed (palette, eyes, hair, and so on). */
export function describeFace(seed: string, options: AvatarOptions = {}): FaceTraits {
  return buildFace(seed, options).traits;
}

const EYE_SHAPES = [0, 0, 0, 1, 2, 3, 4, 5, 6, 7]; // circle weighted 3x
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Face avatar. Structure varies per seed: hair can come from the top, bottom
 * or a side (with a tilt), with 1-4 layered bands in mixed edge styles. Eyes
 * come in eight shapes, in counts of 1 to 4, at varied sizes, spacing and
 * heights. Background, brows, nose and mouth vary. Nine palette modes.
 * Rare seeds: cyclops (2%), three eyes (3%), gold on dark (6%).
 * The order of PRNG draws is part of the output contract.
 */
export function buildFace(seed: string, options: AvatarOptions = {}): { svg: string; traits: FaceTraits } {
  const canonical = normalizeSeed(seed, options.normalize);
  const rng = createSeedRng(canonical);
  const nx = () => rng.next();
  /** Uniform pick of one of n evenly spaced levels in [0, 1]. */
  const qn = (n: number) => Math.floor(nx() * n) / (n - 1);
  /** n evenly spaced levels from lo to hi. */
  const qg = (lo: number, hi: number, n: number) => lo + (hi - lo) * qn(n);
  const minContrast = options.minContrast ?? 3;
  const radius = clamp(options.radius ?? 0, 0, 0.5);
  const showPupils = options.pupils ?? true;
  const useRarity = options.rarity ?? true;

  // Every random value is drawn here, unconditionally, in this order.
  const rarityRoll = nx();
  const modeRoll = nx();
  // Every continuous trait is snapped to a few levels so that one different
  // hash bit gives a clearly different face, not a near-identical one.
  const hue0 = qg(0, 330, 12);
  const off2 = qg(60, 180, 3);
  const off3 = qg(60, 180, 3);
  const earthV = qn(4);
  const bgModeRoll = nx();
  const bgAngle = qg(0, 315, 8);
  const bgOff = qg(-18, 18, 3);
  const orientRoll = nx();
  const tiltDeg = qg(-12, 12, 3);
  const bandRoll = nx();
  const baseRoll = qn(5);
  const h: HairParams = {
    f1: qg(0.06, 0.2, 3),
    f2: 0,
    a1: qg(1.5, 9, 3),
    a2: qg(0.3, 4, 2),
    p1: qg(0, 4.71, 4),
    p2: qg(0, 4.71, 4),
    tilt: qg(-14, 14, 3),
    zig: Math.round(qg(4, 12, 3)),
    zigAmp: qg(2, 6, 3),
    bump: qg(2.5, 7, 3),
    scal: Math.round(qg(3, 9, 3)),
  };
  h.f2 = h.f1 * qg(1.8, 2.8, 2);
  const bandGaps = [qg(3, 14, 3), qg(3, 14, 3), qg(3, 14, 3), qg(3, 14, 3)];
  const bandStyleMix = nx();
  const bandStyles = [nx(), nx(), nx(), nx()];
  const gradRoll = nx();
  const eyeShapeSame = nx();
  const eyeSizeBase = qg(7, 15, 3);
  const eyePitch = qg(14, 62, 4);
  const eyeCx = qg(-8, 8, 3);
  const eyeFrac = qn(3);
  const eyeRaw = [0, 1, 2, 3].map(() => ({
    size: qg(0.65, 1.3, 3),
    shape: nx(),
    tilt: qg(-25, 25, 3),
    color: nx(),
    jy: qg(-4, 4, 3),
    ratio: qn(2),
  }));
  const pupilScale = qg(0.35, 0.6, 2);
  const lookAngle = qg(0, 5.5, 8);
  const lookAmt = qg(0, 0.4, 3);
  const browRoll = nx();
  const browStyle = nx();
  const mood = qg(-1, 1, 3);
  const lift1 = qg(0, 3, 2);
  const lift2 = qg(0, 3, 2);
  const mouthRoll = nx();
  const mouthKind = nx();
  const mouthW = qg(5, 18, 3);
  const mouthGap = qg(5, 12, 2);
  const mouthStroke = qg(2, 4, 2);
  const mouthOff = qg(-6, 6, 3);
  const noseRoll = nx();
  const noseKind = nx();
  const pastelV = Array.from({ length: 10 }, () => qn(3));

  // Rarity.
  const tier = !useRarity ? "common" : rarityRoll < 0.02 ? "cyclops" : rarityRoll < 0.05 ? "three" : rarityRoll < 0.11 ? "gold" : "common";
  const eyeCount = tier === "cyclops" ? 1 : tier === "three" ? 3 : 2;

  // Palette.
  const mode = tier === "gold" ? "gold" : (MODES[Math.floor(modeRoll * MODES.length)] as string);
  const pal = makePalette(mode, hue0, hue0 + off2, hue0 + off3, earthV, pastelV);
  const bg = rgbOf(pal.bg);
  const bg2 = rgbOf(pal.bg2);
  const hairColors = pal.hair.map((c) => rgbOf(c));
  const eyeColors = pal.eyes.map((c) => {
    const [hh, ss, ll] = c;
    return ensureContrast(((hh % 360) + 360) % 360, clamp(ss, 0, 100), ll, bg, minContrast);
  });
  const inkHsl = pal.ink;
  const ink = ensureContrast(((inkHsl[0] % 360) + 360) % 360, clamp(inkHsl[1], 0, 100), inkHsl[2], bg, minContrast);

  // Hair: orientation, band count, depth.
  let rot = orientRoll < 0.55 ? 0 : orientRoll < 0.67 ? 180 : orientRoll < 0.84 ? 90 : 270;
  const tilted = bandRoll > 0.35 && rot === 0 ? tiltDeg : rot === 0 ? 0 : tiltDeg * 0.5;
  const bandCount = bandRoll < 0.12 ? 1 : bandRoll < 0.45 ? 2 : bandRoll < 0.8 ? 3 : 4;
  const base = 5 + Math.pow(baseRoll, 1.6) * 34;
  const mixStyles = bandStyleMix < 0.4;
  const mainStyle: HairStyle = options.hair ?? (HAIR_STYLES[Math.floor(bandStyles[0]! * HAIR_STYLES.length)] as HairStyle);
  const bands: { d: string; color: RGB }[] = [];
  let depth = 0;
  let by = base;
  for (let i = 0; i < bandCount; i++) {
    const st: HairStyle =
      i > 0 && mixStyles && !options.hair ? (HAIR_STYLES[Math.floor(bandStyles[i]! * HAIR_STYLES.length)] as HairStyle) : mainStyle;
    const edge = hairEdge(st, h, by, i * 0.35, i);
    depth = Math.max(depth, edge.maxY);
    bands.push({ d: edge.d, color: hairColors[i] as RGB });
    by += bandGaps[i]!;
  }
  const tiltMargin = Math.abs(Math.sin((tilted * Math.PI) / 180)) * 50;
  depth = Math.min(depth + tiltMargin + 3, 46);
  const gradient = options.gradient ?? gradRoll < 0.35;

  // Free rectangle left for the face after hair.
  let fx0 = 0;
  let fx1 = V;
  let fy0 = 0;
  let fy1 = V;
  if (rot === 0) fy0 = depth;
  else if (rot === 180) fy1 = V - depth;
  else if (rot === 90) fx1 = V - depth;
  else fx0 = depth;

  // Brows, nose, mouth presence.
  const brows = options.eyebrows ?? browRoll < 0.6;
  const mouthOn = options.mouth ?? mouthRoll < 0.75;
  const noseOn = noseRoll < 0.4;

  // Eyes. Build, then scale to fit the free rectangle.
  interface EyeSpec {
    shape: number;
    rx: number;
    ry: number;
    tilt: number;
    color: RGB;
    x: number;
    y: number;
  }
  const specs: EyeSpec[] = [];
  const bigScale = tier === "cyclops" ? 1.5 : tier === "three" ? 0.8 : 1;
  for (let k = 0; k < eyeCount; k++) {
    const e = eyeRaw[k]!;
    const shapeSrc = eyeShapeSame < 0.7 ? eyeRaw[0]!.shape : e.shape;
    const shape = EYE_SHAPES[Math.floor(shapeSrc * EYE_SHAPES.length)] as number;
    const r = eyeSizeBase * e.size * bigScale;
    let rx = r;
    let ry = r;
    if (shape === 1) { rx = r * 0.7; ry = r * 1.15; }
    else if (shape === 2) { rx = r * 1.25; ry = r * 0.75; }
    else if (shape === 6) { rx = r * 0.3; ry = r * 1.15; }
    else if (shape === 4) { ry = r * 0.55 + 0 * e.ratio; }
    const tilt = shape === 0 ? 0 : e.tilt;
    specs.push({ shape, rx, ry, tilt, color: eyeColors[e.color < 0.5 ? 0 : 1] as RGB, x: 0, y: 0 });
  }
  const mouthSpace = mouthOn ? 16 + mouthGap : 0;
  const browSpace = brows ? 9 : 3;
  const noseSpace = noseOn ? 8 : 0;
  const freeW = fx1 - fx0 - 12;
  const freeH = fy1 - fy0 - browSpace - 4 - mouthSpace - noseSpace;
  const rowH = Math.max(...specs.map((s) => Math.max(s.rx, s.ry) * 1.1));
  let pitch = eyeCount === 1 ? 0 : eyePitch * (eyeCount === 3 ? 0.7 : 1);
  const rowW = pitch * (eyeCount - 1) + 2 * Math.max(...specs.map((s) => Math.max(s.rx, s.ry)));
  const scale = clamp(Math.min(freeH / (2 * rowH), freeW / rowW, 1.3), 0.45, 1.3);
  for (const s of specs) { s.rx *= scale; s.ry *= scale; }
  pitch *= scale;
  const rowH2 = rowH * scale;
  const cx = (fx0 + fx1) / 2 + eyeCx;
  const yTop = fy0 + browSpace + rowH2;
  const yBot = Math.max(yTop, fy1 - 6 - mouthSpace - noseSpace - rowH2);
  const cy = lerp(yTop, yBot, eyeFrac);
  specs.forEach((s, k) => {
    const e = eyeRaw[k]!;
    const ext = Math.max(s.rx, s.ry);
    s.x = clamp(cx + (k - (eyeCount - 1) / 2) * pitch, fx0 + 5 + ext, fx1 - 5 - ext);
    s.y = clamp(cy + e.jy * scale + (eyeCount === 3 && k === 1 ? -rowH2 * 0.6 : 0), fy0 + browSpace + ext * 0.5, fy1 - 5 - ext);
    const up = brows ? ext + 11 : ext;
    [s.x, s.y] = pull(s.x, s.y, (x, y) => [[x - ext, y], [x + ext, y], [x, y + ext], [x, y - up], [x - ext * 0.8, y - up], [x + ext * 0.8, y - up]]);
  });

  // Output.
  const uid = seedId(canonical);
  const bgMode = bgModeRoll < 0.5 ? "flat" : bgModeRoll < 0.8 ? "split" : "grad";
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${V} ${V}"`;
  out += options.size ? ` width="${options.size}" height="${options.size}"` : "";
  out += ` role="img" aria-label="Avatar">`;
  let defs = `<clipPath id="c${uid}"><rect width="${V}" height="${V}" rx="${num(radius * V)}"/></clipPath>`;
  if (bgMode === "grad") {
    defs += `<linearGradient id="b${uid}" gradientTransform="rotate(${num(bgAngle)} .5 .5)"><stop offset="0" stop-color="${hex(bg)}"/><stop offset="1" stop-color="${hex(bg2)}"/></linearGradient>`;
  }
  if (gradient) {
    const top = bands[0]!.color;
    const topHsl = pal.hair[0] as HSL;
    const alt = rgbOf([topHsl[0] + 40, topHsl[1], topHsl[2] + 8]);
    defs += `<linearGradient id="g${uid}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${num(base + 8)}"><stop offset="0" stop-color="${hex(alt)}"/><stop offset="1" stop-color="${hex(top)}"/></linearGradient>`;
  }
  out += `<defs>${defs}</defs><g clip-path="url(#c${uid})">`;
  out += `<rect width="${V}" height="${V}" fill="${bgMode === "grad" ? `url(#b${uid})` : hex(bg)}"/>`;
  if (bgMode === "split") {
    out += `<rect x="-60" y="${num(50 + bgOff)}" width="220" height="160" fill="${hex(bg2)}" transform="rotate(${num(bgAngle)} 50 50)"/>`;
  }

  const orient = (rot / 90) % 4;
  rot += tilted;
  out += `<g transform="rotate(${num(rot)} 50 50)">`;
  for (let i = bands.length - 1; i >= 0; i--) {
    const fill = i === 0 && gradient ? `url(#g${uid})` : hex((bands[i] as { color: RGB }).color);
    out += `<path fill="${fill}" d="${(bands[i] as { d: string }).d}"/>`;
  }
  out += `</g>`;

  const dark: RGB = [20, 20, 24];
  const light: RGB = [250, 250, 250];
  const lookX = Math.cos(lookAngle) * lookAmt;
  const lookY = Math.sin(lookAngle) * lookAmt;
  for (const s of specs) {
    const col = hex(s.color);
    const t = s.tilt ? ` transform="rotate(${num(s.tilt)} ${num(s.x)} ${num(s.y)})"` : "";
    const r = Math.max(s.rx, s.ry);
    if (s.shape === 0 || s.shape === 1 || s.shape === 2 || s.shape === 6) {
      out += `<ellipse cx="${num(s.x)}" cy="${num(s.y)}" rx="${num(s.rx)}" ry="${num(s.ry)}" fill="${col}"${t}/>`;
    } else if (s.shape === 3) {
      out += `<rect x="${num(s.x - r)}" y="${num(s.y - r)}" width="${num(2 * r)}" height="${num(2 * r)}" rx="${num(r * 0.35)}" fill="${col}"${t}/>`;
    } else if (s.shape === 4) {
      out += `<path d="M${num(s.x - r)} ${num(s.y - r * 0.3)}A${num(r)} ${num(r)} 0 0 0 ${num(s.x + r)} ${num(s.y - r * 0.3)}Z" fill="${col}"${t}/>`;
    } else if (s.shape === 5) {
      out += `<circle cx="${num(s.x)}" cy="${num(s.y)}" r="${num(r * 0.82)}" fill="none" stroke="${col}" stroke-width="${num(r * 0.34)}"/>`;
    } else {
      out += `<rect x="${num(s.x - r * 0.8)}" y="${num(s.y - r * 0.8)}" width="${num(r * 1.6)}" height="${num(r * 1.6)}" fill="${col}" transform="rotate(45 ${num(s.x)} ${num(s.y)})"/>`;
    }
    if (showPupils && (s.shape <= 3 || s.shape === 5)) {
      const re = Math.min(s.rx, s.ry);
      const pc = contrast(s.color, dark) > contrast(s.color, light) ? dark : light;
      out += `<circle cx="${num(s.x + lookX * re)}" cy="${num(s.y + lookY * re)}" r="${num(re * pupilScale)}" fill="${hex(pc)}"/>`;
    }
  }

  const inkHex = hex(ink);
  if (brows) {
    const sw = browStyle < 0.35 ? 2.4 : browStyle < 0.7 ? 4 : 1.6;
    if (browStyle > 0.85 && eyeCount === 2) {
      const a = specs[0] as EyeSpec;
      const b = specs[1] as EyeSpec;
      const y = Math.min(a.y - Math.max(a.rx, a.ry), b.y - Math.max(b.rx, b.ry)) - 5;
      out += `<path d="M${num(a.x - a.rx)} ${num(y)}L${num(b.x + b.rx)} ${num(y)}" stroke="${inkHex}" stroke-width="4.5" stroke-linecap="round"/>`;
    } else {
      specs.forEach((s, idx) => {
        const side = eyeCount === 1 ? 0 : idx === 0 ? -1 : idx === eyeCount - 1 ? 1 : 0;
        const ext = Math.max(s.rx, s.ry);
        const bY = s.y - ext - 4 - (idx === 0 ? lift1 : lift2);
        const half = ext * (side === 0 ? 1 : 0.9);
        const tt = side === 0 ? 0 : mood * 4;
        const yl = side === 1 ? bY + tt : bY - tt;
        const yr = side === 1 ? bY - tt : bY + tt;
        if (browStyle > 0.7 && browStyle <= 0.85) {
          out += `<path d="M${num(s.x - half)} ${num(yl)}Q${num(s.x)} ${num(bY - 5)} ${num(s.x + half)} ${num(yr)}" fill="none" stroke="${inkHex}" stroke-width="2.2" stroke-linecap="round"/>`;
        } else {
          out += `<path d="M${num(s.x - half)} ${num(yl)}L${num(s.x + half)} ${num(yr)}" stroke="${inkHex}" stroke-width="${sw}" stroke-linecap="round"/>`;
        }
      });
    }
  }

  const lowest = Math.max(...specs.map((s) => s.y + Math.max(s.rx, s.ry)));
  let midX = clamp(specs.reduce((a, s) => a + s.x, 0) / specs.length + mouthOff, fx0 + 10, fx1 - 10);
  let nextY = lowest + 5;
  if (noseOn && nextY < fy1 - 10) {
    [midX, nextY] = pull(midX, nextY, (x, y) => [[x - 4, y - 3], [x + 4, y + 5]]);
    if (noseKind < 0.5) out += `<circle cx="${num(midX)}" cy="${num(nextY + 1)}" r="2" fill="${inkHex}"/>`;
    else out += `<path d="M${num(midX - 1)} ${num(nextY - 2)}V${num(nextY + 4)}H${num(midX + 4)}" fill="none" stroke="${inkHex}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    nextY += 7;
  }
  if (mouthOn) {
    const w = Math.min(mouthW, (fx1 - fx0) / 2 - 6);
    const kind = Math.floor(mouthKind * 7);
    const reach = [w * 0.45, w * 0.1, 0, w / 2.4, w, 4, 2][kind] as number;
    let my = clamp(nextY + mouthGap * 0.6, 0, fy1 - 3 - reach);
    [midX, my] = pull(midX, my, (x, y) => [[x - w, y], [x + w, y], [x, y + reach]]);
    const sw = num(mouthStroke);
    if (kind === 0) out += `<path d="M${num(midX - w)} ${num(my)}Q${num(midX)} ${num(my + w * 0.9)} ${num(midX + w)} ${num(my)}" fill="none" stroke="${inkHex}" stroke-width="${sw}" stroke-linecap="round"/>`;
    else if (kind === 1) out += `<path d="M${num(midX - w)} ${num(my + w * 0.4)}Q${num(midX)} ${num(my - w * 0.5)} ${num(midX + w)} ${num(my + w * 0.4)}" fill="none" stroke="${inkHex}" stroke-width="${sw}" stroke-linecap="round"/>`;
    else if (kind === 2) out += `<path d="M${num(midX - w)} ${num(my)}H${num(midX + w)}" stroke="${inkHex}" stroke-width="${sw}" stroke-linecap="round"/>`;
    else if (kind === 3) out += `<circle cx="${num(midX)}" cy="${num(my)}" r="${num(w / 2.4)}" fill="${inkHex}"/>`;
    else if (kind === 4) out += `<path d="M${num(midX - w)} ${num(my)}A${num(w)} ${num(w)} 0 0 0 ${num(midX + w)} ${num(my)}Z" fill="${inkHex}"/>`;
    else if (kind === 5) {
      let d = `M${num(midX - w)} ${num(my)}`;
      for (let k = 1; k <= 4; k++) d += `L${num(midX - w + (w * 2 * k) / 4)} ${num(my + (k % 2 ? 4 : 0))}`;
      out += `<path d="${d}" fill="none" stroke="${inkHex}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else out += `<circle cx="${num(midX)}" cy="${num(my)}" r="1.8" fill="${inkHex}"/>`;
  }
  const traits: FaceTraits = {
    tier,
    palette: mode,
    hue: Math.round(hue0 / 30) % 12,
    orientation: orient,
    tilt: Math.sign(tilted),
    bands: bandCount,
    hairStyle: mainStyle,
    mixedHair: mixStyles && !options.hair,
    hairDepth: Math.round(baseRoll * 4),
    gradient,
    background: bgMode,
    eyeCount,
    eyeShapes: specs.map((sp) => sp.shape).join(""),
    eyeSize: Math.round(((eyeSizeBase - 7) / 8) * 2),
    eyeSpacing: Math.round(((eyePitch - 14) / 48) * 3),
    eyeHeight: Math.round(eyeFrac * 2),
    brows: brows ? (browStyle < 0.35 ? 0 : browStyle < 0.7 ? 1 : browStyle < 0.85 ? 2 : 3) : -1,
    mood: Math.round(mood),
    mouth: mouthOn ? Math.floor(mouthKind * 7) : -1,
    nose: noseOn ? (noseKind < 0.5 ? 0 : 1) : -1,
  };
  return { svg: out + `</g></svg>`, traits };
}
