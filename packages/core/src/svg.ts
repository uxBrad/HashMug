import { createFaceSvg } from "./face";
import type { AvatarOptions } from "./types";

/** Keep only the public options, even if a JS caller passes more. */
export function publicOptions(o: AvatarOptions = {}): AvatarOptions {
  const out: AvatarOptions = {};
  if (o.normalize !== undefined) out.normalize = o.normalize;
  if (o.size !== undefined) out.size = o.size;
  if (o.radius !== undefined) out.radius = o.radius;
  return out;
}

/** One call: seed in, SVG string out. Same seed always gives the same face. */
export function createAvatar(seed: string, options: AvatarOptions = {}): string {
  return createFaceSvg(seed, publicOptions(options));
}

/** SVG as a `data:` URI, usable directly in `<img src>` or CSS. */
export function createAvatarDataUri(seed: string, options: AvatarOptions = {}): string {
  return "data:image/svg+xml;utf8," + encodeURIComponent(createAvatar(seed, options));
}
