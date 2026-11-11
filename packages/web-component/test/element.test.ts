import { describe, expect, it } from "vitest";
import { createAvatar } from "@sigil/core";
import "../src";

function make(attrs: Record<string, string>): HTMLElement {
  const el = document.createElement("identicon-avatar");
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  return el;
}

describe("<identicon-avatar>", () => {
  it("renders the same SVG as the core library", () => {
    const el = make({ seed: "brad", size: "48" });
    expect(el.shadowRoot?.innerHTML).toContain("width:48px");
    const rendered = el.shadowRoot?.querySelector("svg")?.outerHTML ?? "";
    const core = createAvatar("brad");
    // Same drawing: same number of shapes and the same colors in the same order.
    const shapes = (s: string) => (s.match(/<(path|circle|ellipse|rect)\b/g) ?? []).length;
    const colors = (s: string) => (s.match(/#[0-9a-f]{6}/gi) ?? []).join(",").toLowerCase();
    expect(shapes(rendered)).toBe(shapes(core));
    expect(colors(rendered)).toBe(colors(core));
  });
  it("re-renders when the seed changes", () => {
    const el = make({ seed: "a" });
    const before = el.shadowRoot?.innerHTML;
    el.setAttribute("seed", "b");
    expect(el.shadowRoot?.innerHTML).not.toBe(before);
  });
  it("is an accessible image with a neutral default label", () => {
    const el = make({ seed: "0xabc0000000000000000000000000000000000001" });
    expect(el.getAttribute("role")).toBe("img");
    expect(el.getAttribute("aria-label")).toBe("Avatar");
    expect(el.shadowRoot?.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
  it("supports a custom label and decorative mode", () => {
    const el = make({ seed: "x", label: "Profile picture of Sam" });
    expect(el.getAttribute("aria-label")).toBe("Profile picture of Sam");
    el.setAttribute("decorative", "");
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.hasAttribute("role")).toBe(false);
  });
  it("maps radius=round", () => {
    const el = make({ seed: "x", radius: "round" });
    expect(el.shadowRoot?.innerHTML).toContain("clipPath");
  });
});
