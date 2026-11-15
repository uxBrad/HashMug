import { createAvatar } from "./svg";
import type { AvatarOptions } from "./types";

type Ctx = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
type Target = HTMLCanvasElement | OffscreenCanvas | Ctx;

function contextOf(target: Target): Ctx {
  if ("drawImage" in target) return target as Ctx;
  const ctx = (target as HTMLCanvasElement | OffscreenCanvas).getContext("2d");
  if (!ctx) throw new Error("hashmug: could not get a 2d context");
  return ctx as Ctx;
}

async function toDrawable(svg: string): Promise<CanvasImageSource> {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  if (typeof Image === "undefined") return createImageBitmap(blob); // workers
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Draw the avatar for a seed onto a canvas (or a 2D context), filling it from
 * the top-left corner. `size` defaults to the canvas width. The canvas is not
 * resized or cleared outside the avatar, so round avatars keep a transparent
 * corner you can draw over.
 *
 * Browser only (needs Blob and image decoding). In Node use `@hashmug/png`.
 */
export async function drawAvatar(target: Target, seed: string, options: AvatarOptions = {}): Promise<void> {
  const ctx = contextOf(target);
  const size = options.size ?? ctx.canvas.width;
  const svg = createAvatar(seed, { ...options, size });
  const image = await toDrawable(svg);
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(image, 0, 0, size, size);
}
