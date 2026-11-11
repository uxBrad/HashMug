import type { AvatarOptions, HairStyle } from "@sigil/core";

const HAIR: HairStyle[] = ["wave", "slope", "zigzag", "scallop", "straight"];
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

function bool(q: URLSearchParams, key: string): boolean | undefined {
  const v = q.get(key);
  if (v === null || v === "") return undefined;
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  throw new ParamError(`${key} must be true or false`);
}

function oneOf<T extends string>(q: URLSearchParams, key: string, allowed: readonly T[]): T | undefined {
  const v = q.get(key);
  if (v === null || v === "") return undefined;
  if (!(allowed as readonly string[]).includes(v)) throw new ParamError(`${key} must be one of ${allowed.join(", ")}`);
  return v as T;
}

/** Parse and validate query parameters into avatar options. Whitelist only. */
export function parseOptions(q: URLSearchParams): { options: AvatarOptions; size: number | undefined } {
  const radiusRaw = q.get("radius");
  const options: AvatarOptions = {
    radius: radiusRaw === "round" ? 0.5 : num(q, "radius", 0, 0.5),
    hair: oneOf(q, "hair", HAIR),
    gradient: bool(q, "gradient"),
    pupils: bool(q, "pupils"),
    eyebrows: bool(q, "eyebrows"),
    mouth: bool(q, "mouth"),
    rarity: bool(q, "rarity"),
  };
  for (const k of Object.keys(options) as (keyof AvatarOptions)[]) if (options[k] === undefined) delete options[k];
  return { options, size: num(q, "size", 16, MAX_PNG_SIZE) };
}
