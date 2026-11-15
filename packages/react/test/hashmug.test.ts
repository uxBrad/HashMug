import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it } from "vitest";
import { HashMug } from "../src";

const html = (props: Parameters<typeof HashMug>[0]) => renderToStaticMarkup(createElement(HashMug, props));

it("renders a sized img with a neutral alt, never the seed", () => {
  const out = html({ seed: "0xabcdef0123456789abcdef0123456789abcdef01", size: 48, radius: "round" });
  expect(out).toContain('width="48"');
  expect(out).toContain('alt="Avatar"');
  expect(out).not.toContain("0xabcdef");
  expect(out).toContain("data:image/svg+xml");
});

it("label sets alt, decorative hides it", () => {
  expect(html({ seed: "a", label: "Profile picture" })).toContain('alt="Profile picture"');
  const d = html({ seed: "a", decorative: true });
  expect(d).toContain('alt=""');
  expect(d).toContain('aria-hidden="true"');
});

it("same seed gives the same markup, round differs from square", () => {
  expect(html({ seed: "a" })).toBe(html({ seed: "a" }));
  expect(html({ seed: "a", radius: "round" })).not.toBe(html({ seed: "a" }));
});
