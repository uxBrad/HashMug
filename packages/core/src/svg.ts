import { createFaceSvg } from "./face";
import type { AvatarOptions } from "./types";

/** One call: seed in, SVG string out. Same seed always gives the same avatar. */
export function createAvatar(seed: string, options: AvatarOptions = {}): string {
  return createFaceSvg(seed, options);
}

/** SVG as a `data:` URI, usable directly in `<img src>` or CSS. */
export function createAvatarDataUri(seed: string, options: AvatarOptions = {}): string {
  return "data:image/svg+xml;utf8," + encodeURIComponent(createAvatar(seed, options));
}
