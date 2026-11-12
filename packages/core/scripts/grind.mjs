// Estimates how hard it is to grind a wallet address whose face avatar looks
// like a target's.
// Run: pnpm --filter @hashmug/core build && node packages/core/scripts/grind.mjs [N]
import { describeFace, createSeedRng } from "../dist/index.js";

const N = Number(process.argv[2] ?? 150000);

// Traits are grouped into blocks that are drawn independently. The strict class
// count is estimated per block (collisions are measurable inside a block) and
// the block probabilities are multiplied. A full-key collision count is not
// measurable at this sample size because there are too many classes.
const BLOCKS = {
  "color + background": ["tier", "palette", "hue", "background", "bgPattern", "bgPatternSize", "gradient"],
  hair: ["orientation", "tilt", "bands", "hairStyle", "mixedHair", "hairDepth", "hairPattern", "hairPatternSize", "edgeLevel", "bandGap"],
  eyes: ["eyeCount", "eyeShapes", "eyeSize", "eyeSpacing", "eyeHeight", "eyeTilt", "eyeColors", "glint", "pupilShape", "pupilSize", "lookDir", "outline", "eyeExtra"],
  "brows, nose, mouth": ["brows", "browAccent", "mood", "liftAsym", "mouth", "mouthAccent", "nose", "noseSize"],
};

// Loose: what is still visible in a small thumbnail. Counted directly.
const LOOSE = ["tier", "palette", "hue", "orientation", "bands", "hairStyle", "background", "eyeCount", "eyeShapes", "eyeSize", "eyeHeight", "mouth"];

// Wider glance: also counts hair thickness, eye spacing, brows and mood, which
// are all readable at 64px and up. A larger set means more work for an attacker.
const LOOSE_WIDE = [...LOOSE, "hairDepth", "eyeSpacing", "brows", "mood"];

const keyOf = (t, fields) => fields.map((f) => t[f]).join("|");

function collisionStats(list, fields) {
  const counts = new Map();
  for (const t of list) {
    const k = keyOf(t, fields);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const n = list.length;
  let pairs = 0;
  let max = 0;
  for (const c of counts.values()) {
    pairs += c * (c - 1);
    max = Math.max(max, c);
  }
  return { classes: counts.size, pairs: pairs / 2, p: pairs / (n * (n - 1)), maxShare: max / n };
}

const rng = createSeedRng("grind-seed-source");
const list = [];
for (let i = 0; i < N; i++) {
  const addr = "0x" + Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(rng.next() * 16)]).join("");
  list.push(describeFace(addr));
}

const log2 = (x) => Math.log2(x);
const fmt = (x) => (x >= 1e6 ? x.toExponential(2) : Math.round(x).toLocaleString());
console.log(`Sampled ${N.toLocaleString()} random addresses\n`);

let pStrict = 1;
let worstStrict = 1;
console.log("Strict match (every prominent trait equal), per independent block:");
for (const [name, fields] of Object.entries(BLOCKS)) {
  const r = collisionStats(list, fields);
  pStrict *= r.p;
  worstStrict *= r.maxShare;
  console.log(`  ${name.padEnd(20)} ${String(r.classes).padStart(7)} classes seen, ${String(r.pairs).padStart(9)} colliding pairs, ~${fmt(1 / r.p)} tries for this block`);
}
console.log(`  => expected addresses to match a random victim: ~${fmt(1 / pStrict)} (about 2^${log2(1 / pStrict).toFixed(1)})`);
console.log(`  => commonest-look victim: ~${fmt(1 / worstStrict)} (about 2^${log2(1 / worstStrict).toFixed(1)})`);

const l = collisionStats(list, LOOSE);
console.log(`\nLoose match (thumbnail-visible traits), measured directly:`);
console.log(`  ${l.classes.toLocaleString()} classes seen, ${l.pairs.toLocaleString()} colliding pairs`);
console.log(`  => expected addresses to match a random victim: ~${fmt(1 / l.p)} (about 2^${log2(1 / l.p).toFixed(1)})`);
console.log(`  => commonest-look victim: ~${fmt(1 / l.maxShare)}`);
const w = collisionStats(list, LOOSE_WIDE);
console.log(`\nWider glance (adds hair thickness, eye spacing, brows, mood), measured directly:`);
console.log(`  ${w.classes.toLocaleString()} classes seen, ${w.pairs.toLocaleString()} colliding pairs`);
console.log(`  => expected addresses to match a random victim: ~${fmt(1 / w.p)} (about 2^${log2(1 / w.p).toFixed(1)})`);
console.log(`  => commonest-look victim: ~${fmt(1 / w.maxShare)}`);
console.log(`\nNote: blocks are treated as independent. Small correlations (for example cyclops tier fixes eye count) make the strict figure slightly optimistic.`);
