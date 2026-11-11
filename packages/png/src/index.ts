import { Resvg } from "@resvg/resvg-js";
import { createAvatar, type AvatarOptions } from "@sigil/core";

export interface RgbaImage {
  width: number;
  height: number;
  /** Straight (non-premultiplied) RGBA, row by row, 4 bytes per pixel. */
  data: Uint8Array;
}

function clampSize(size: number): number {
  return Math.min(2048, Math.max(8, Math.round(size)));
}

/** Rasterize an SVG string to a square image of `size` px. */
export function rasterizeSvg(svg: string, size = 256): { png: Uint8Array; rgba: RgbaImage } {
  const px = clampSize(size);
  const img = new Resvg(svg, { fitTo: { mode: "width", value: px } }).render();
  return {
    png: new Uint8Array(img.asPng()),
    rgba: { width: img.width, height: img.height, data: new Uint8Array(img.pixels) },
  };
}

/** PNG bytes for a seed. Corners are transparent when `radius` is set. */
export function avatarPng(seed: string, options: AvatarOptions = {}, size = 256): Uint8Array {
  return rasterizeSvg(createAvatar(seed, options), size).png;
}

/** Raw RGBA pixels for a seed, ready for canvas, textures or other encoders. */
export function avatarPixels(seed: string, options: AvatarOptions = {}, size = 256): RgbaImage {
  return rasterizeSvg(createAvatar(seed, options), size).rgba;
}

/** Rasterizer in the shape `@sigil/edge` expects: SVG string and size in, PNG out. */
export const rasterizeToPng = (svg: string, size: number): Uint8Array => rasterizeSvg(svg, size).png;
