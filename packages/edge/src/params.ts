import type { AvatarOptions } from "@hashmug/core";

export const MAX_SEED_LENGTH = 400;
export const MAX_PNG_SIZE = 1024;

export class ParamError extends Error {}

function num(q: URLSearchParams, key: string, lo: number, hi: number): number | undefined {
  const v = q.get(key);
  if (v === null || v === "") return undefined;
  const n = Number(v);
  if (!Number.isFinite(n) || n < lo || n > hi) throw new ParamError(`${key} must be a number from ${lo} to ${hi}`);
  return n;
}

/**
 * Parse and validate query parameters. Only presentation options exist
 * (size, radius): the same seed gives the same face from every server.
 */
export function parseOptions(q: URLSearchParams): { options: AvatarOptions; size: number | undefined } {
  const radiusRaw = q.get("radius");
  const options: AvatarOptions = {};
  const radius = radiusRaw === "round" ? 0.5 : num(q, "radius", 0, 0.5);
  if (radius !== undefined) options.radius = radius;
  return { options, size: num(q, "size", 16, MAX_PNG_SIZE) };
}
