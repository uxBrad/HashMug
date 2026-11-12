// Regenerates docs/avatars/*.svg used in the README.
import { createAvatar } from "../dist/index.js";
import { writeFileSync, mkdirSync } from "node:fs";
const seeds = ["ada", "grace", "alan", "linus", "margaret", "tim", "hedy", "dennis",
  "radia", "ken", "barbara", "guido", "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  "0x71C7656EC7ab88b098defB751B7401B5f6d8976E", "hello@example.com", "hashmug"];
const out = new URL("../../../docs/avatars/", import.meta.url);
mkdirSync(out, { recursive: true });
for (const s of seeds) {
  const name = s.startsWith("0x") ? "eth-" + s.slice(-4) : s.replace(/[^a-z0-9]+/gi, "-");
  writeFileSync(new URL(name + ".svg", out), createAvatar(s, { size: 128, radius: 0.5, normalize: s.startsWith("0x") ? "ethereum" : undefined }));
  console.log(name, s);
}
