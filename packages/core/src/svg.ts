import { createModel } from "./generate";
import { hashSeed } from "./hash";
import type { AvatarModel, AvatarOptions, Cell } from "./types";

const num = (n: number) => String(Math.round(n * 1000) / 1000);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Render a model to a compact SVG string. For square tiles, horizontal
 * runs of cells merge into single path segments, one path per color.
 */
export function renderSvg(model: AvatarModel, seed: string, options: AvatarOptions = {}): string {
  const { grid, background, colors, cells } = model;
  const padding = clamp(options.padding ?? 0.1, 0, 0.4);
  const radius = clamp(options.radius ?? 0, 0, 0.5);
  const tile = options.tile ?? "square";

  const V = 100; // viewBox is always 100 x 100
  const pad = padding * V;
  const cell = (V - pad * 2) / grid;

  const size = options.size ? ` width="${options.size}" height="${options.size}"` : "";
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${V} ${V}"${size} role="img" aria-label="Avatar">`;

  let clipAttr = "";
  if (radius > 0) {
    const id = "c" + hashSeed(seed).toString(36);
    out += `<clipPath id="${id}"><rect width="${V}" height="${V}" rx="${num(radius * V)}"/></clipPath>`;
    clipAttr = ` clip-path="url(#${id})"`;
  }
  out += `<g${clipAttr}><rect width="${V}" height="${V}" fill="${background}"/>`;

  for (const color of [1, 2] as const) {
    const mine = cells.filter((c) => c.color === color);
    if (mine.length === 0) continue;
    const fill = colors[color - 1];
    if (tile === "square") {
      out += `<path fill="${fill}" d="${runsPath(mine, pad, cell)}"/>`;
    } else {
      const rx = tile === "circle" ? cell / 2 : cell * 0.25;
      out += `<g fill="${fill}">`;
      for (const c of mine) {
        out += `<rect x="${num(pad + c.x * cell)}" y="${num(pad + c.y * cell)}" width="${num(cell)}" height="${num(cell)}" rx="${num(rx)}"/>`;
      }
      out += `</g>`;
    }
  }
  return out + `</g></svg>`;
}

/** Merge horizontal neighbors into one rectangle path segment each. */
function runsPath(cells: Cell[], pad: number, cell: number): string {
  const byRow = new Map<number, number[]>();
  for (const c of cells) {
    const row = byRow.get(c.y);
    if (row) row.push(c.x);
    else byRow.set(c.y, [c.x]);
  }
  let d = "";
  for (const y of [...byRow.keys()].sort((a, b) => a - b)) {
    const xs = (byRow.get(y) as number[]).sort((a, b) => a - b);
    const flush = (a: number, b: number) => {
      const w = (b - a + 1) * cell;
      d += `M${num(pad + a * cell)} ${num(pad + y * cell)}h${num(w)}v${num(cell)}h${num(-w)}z`;
    };
    let start = xs[0] as number;
    let prev = start;
    for (let i = 1; i < xs.length; i++) {
      const x = xs[i] as number;
      if (x !== prev + 1) {
        flush(start, prev);
        start = x;
      }
      prev = x;
    }
    flush(start, prev);
  }
  return d;
}

/** One call: seed in, SVG string out. */
export function createAvatar(seed: string, options: AvatarOptions = {}): string {
  return renderSvg(createModel(seed, options), seed, options);
}

/** SVG as a `data:` URI, usable directly in `<img src>` or CSS. */
export function createAvatarDataUri(seed: string, options: AvatarOptions = {}): string {
  return "data:image/svg+xml;utf8," + encodeURIComponent(createAvatar(seed, options));
}
