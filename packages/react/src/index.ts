import { createElement, type CSSProperties } from "react";
import { createAvatarDataUri } from "@hashmug/core";

export interface HashMugProps {
  /** Any text: name, handle, email, ENS name, wallet address. */
  seed: string;
  /** Pixels. Default 64. */
  size?: number;
  /** 0 (square) to 0.5 (circle), or "round". */
  radius?: number | "round";
  /** Accessible name. Default "Avatar". The seed is never used: an address read aloud is noise. */
  label?: string;
  /** Hide from assistive tech, for when a name sits next to the avatar. */
  decorative?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** `<HashMug seed="0xabc..." size={64} radius="round" />`. Renders an `<img>`; same seed, same face. */
export function HashMug({ seed, size = 64, radius, label = "Avatar", decorative, className, style }: HashMugProps) {
  const r = radius === "round" ? 0.5 : radius;
  return createElement("img", {
    src: createAvatarDataUri(seed, r === undefined ? {} : { radius: r }),
    width: size,
    height: size,
    alt: decorative ? "" : label,
    ...(decorative ? { "aria-hidden": true } : {}),
    className,
    style,
  });
}
