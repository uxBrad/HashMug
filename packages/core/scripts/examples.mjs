// Regenerates docs/avatars/*.svg used in the README.
import { createAvatar } from "../dist/index.js";
import { writeFileSync, mkdirSync } from "node:fs";
const A = "0xc40e72b9a3d15f86e0bd2a7c94f13e58a6d07b2c";
const B = A.slice(0, -1) + "d"; // one character different
export const examples = [
  ["copper.eth", "copper"], ["lantern.eth", "lantern"], ["velvet.eth", "velvet"], ["ember.eth", "ember"],
  ["quartz.eth", "quartz"], ["tundra.eth", "tundra"], ["origami.eth", "origami"], ["mosaic.eth", "mosaic"],
  ["uxbrad.eth", "uxbrad-eth"], ["bob@example.org", "bob-example-org"], ["Amara Okafor", "amara-okafor"],
  ["Priya Shah", "priya-shah"], ["@starlit", "starlit"], ["@uxbrad", "uxbrad"],
  ["0x03e9c5a8d71f4b26a0c8e35d97b14f62d8a0e5c7", "eth-e5c7"], [A, "eth-7b2c"], [B, "eth-7b2d"],
];
const out = new URL("../../../docs/avatars/", import.meta.url);
mkdirSync(out, { recursive: true });
for (const [seed, file] of examples) {
  const normalize = seed.startsWith("0x") ? "ethereum" : undefined;
  writeFileSync(new URL(file + ".svg", out), createAvatar(seed, { size: 128, radius: 0.5, normalize }));
}
