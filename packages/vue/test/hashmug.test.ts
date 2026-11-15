import { createSSRApp, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import { expect, it } from "vitest";
import { HashMug } from "../src";

const html = (props: Record<string, unknown>) => renderToString(createSSRApp({ render: () => h(HashMug, props as never) }));

it("renders a sized img with a neutral alt, never the seed", async () => {
  const out = await html({ seed: "0xabcdef0123456789abcdef0123456789abcdef01", size: 48, radius: "round" });
  expect(out).toContain('width="48"');
  expect(out).toContain('alt="Avatar"');
  expect(out).not.toContain("0xabcdef");
  expect(out).toContain("data:image/svg+xml");
});

it("label sets alt, decorative hides it", async () => {
  expect(await html({ seed: "a", label: "Profile picture" })).toContain('alt="Profile picture"');
  const d = await html({ seed: "a", decorative: true });
  expect(d).toMatch(/ alt(="")?[ >]/); // empty alt, bare or quoted
  expect(d).toContain('aria-hidden="true"');
});

it("same seed gives the same markup, round differs from square", async () => {
  expect(await html({ seed: "a" })).toBe(await html({ seed: "a" }));
  expect(await html({ seed: "a", radius: "round" })).not.toBe(await html({ seed: "a" }));
});
