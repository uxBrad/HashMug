import { createAvatar, type AvatarOptions } from "@sigil/core";

function readNumber(el: Element, name: string): number | undefined {
  const v = el.getAttribute(name);
  if (v === null || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * `<identicon-avatar seed="0xabc..." size="64" radius="round">`
 *
 * Attributes: seed, size (px, default 64), radius (0 to 0.5, or "round"),
 * label, decorative. The face itself is fixed by the seed: no attribute
 * changes it, so the same seed looks the same in every app.
 *
 * Accessibility: the host is role="img" with aria-label from `label`
 * (default "Avatar"). The seed is never used as the label, since a wallet
 * address read aloud is noise. Add `decorative` when a name sits next to it.
 */
export class IdenticonAvatar extends HTMLElement {
  static observedAttributes = ["seed", "size", "radius", "label", "decorative"];

  private root: ShadowRoot;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  /** Build core options from the current attributes. */
  get options(): AvatarOptions {
    const radiusAttr = this.getAttribute("radius");
    const radius = radiusAttr === "round" ? 0.5 : readNumber(this, "radius");
    return radius === undefined ? {} : { radius };
  }

  private render() {
    const size = readNumber(this, "size") ?? 64;
    const seed = this.getAttribute("seed") ?? "";
    // Inner SVG is hidden from assistive tech; the host carries the semantics.
    const svg = createAvatar(seed, this.options).replace(' role="img" aria-label="Avatar"', ' aria-hidden="true" focusable="false"');
    this.root.innerHTML =
      `<style>:host{display:inline-block;width:${size}px;height:${size}px;line-height:0}svg{display:block;width:100%;height:100%}</style>` + svg;
    if (this.hasAttribute("decorative")) {
      this.setAttribute("aria-hidden", "true");
      this.removeAttribute("role");
      this.removeAttribute("aria-label");
    } else {
      this.removeAttribute("aria-hidden");
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", this.getAttribute("label") ?? "Avatar");
    }
  }
}

if (typeof customElements !== "undefined" && !customElements.get("identicon-avatar")) {
  customElements.define("identicon-avatar", IdenticonAvatar);
}
