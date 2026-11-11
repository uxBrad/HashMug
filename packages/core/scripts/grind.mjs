// Estimates how hard it is to grind a wallet address whose face avatar looks
// like a target's. Run: pnpm --filter @sigil/core build && node packages/core/scripts/grind.mjs [N]
import { describeFace, createSeedRng } from "../dist/index.js";

const N = Number(process.argv[2] ?? 300000);

// Strict: every prominent trait matches. Loose: only the first-glance look matches.
const strict = (t) =>
  [t.tier, t.palette, t.hue, t.orientation, t.bands, t.hairStyle, t.gradient, t.background, t.eyeCount, t.eyeShapes, t.eyeSize, t.eyeSpacing, t.eyeHeight, t.brows, t.mouth, t.nose].join("|");
const loose = (t) => [t.tier, t.palette, t.hue, t.orientation, t.eyeCount, t.eyeShapes, t.mouth].join("|");

function stats(keyFn, traitsList) {
  const counts = new Map();
  for (const t of traitsList) {
    const k = keyFn(t);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const n = traitsList.length;
  let pairs = 0;
  let max = 0;
  let H = 0;
  for (const c of counts.values()) {
    pairs += c * (c - 1);
    max = Math.max(max, c);
    H -= (c / n) * Math.log2(c / n);
  }
  const collide = pairs / (n * (n - 1)); // P(two random avatars share a class)
  return { classesSeen: counts.size, collisions: pairs / 2, entropyBitsSampled: H, expectedTriesRandomTarget: collide > 0 ? 1 / collide : Infinity, commonestClassShare: max / n };
}

const rng = createSeedRng("grind-seed-source");
const list = [];
for (let i = 0; i < N; i++) {
  const addr = "0x" + Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(rng.next() * 16)]).join("");
  list.push(describeFace(addr));
}
const fmt = (x) => (Number.isFinite(x) ? Math.round(x).toLocaleString() : "more than " + (N * N).toLocaleString());
console.log(`Sampled ${N.toLocaleString()} random addresses`);
for (const [name, fn] of [["strict", strict], ["loose", loose]]) {
  const r = stats(fn, list);
  console.log(`\n${name}: ${r.classesSeen.toLocaleString()} classes seen, ${r.collisions.toLocaleString()} colliding pairs`);
  console.log(`  expected addresses an attacker must generate to match a random victim: ~${fmt(r.expectedTriesRandomTarget)}`);
  console.log(`  commonest class share: ${(r.commonestClassShare * 100).toFixed(3)}% (worst-case victim: ~${fmt(1 / r.commonestClassShare)} tries)`);
}
