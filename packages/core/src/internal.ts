/**
 * INTERNAL entry point: trait overrides for the sandbox, tests and tooling.
 * Avatars made with overrides will not match the same seed elsewhere.
 * Do not use this in products.
 */
export { createFaceSvg, describeFace } from "./face";
export type { FaceTraits } from "./face";
export type { FaceOverrides, HairStyle } from "./types";
