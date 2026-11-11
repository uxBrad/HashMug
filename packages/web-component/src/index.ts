import { createAvatar, type AvatarOptions, type HairStyle, type TileShape } from "@sigil/core";

const NUMBER_ATTRS = ["grid", "padding", "density"] as const;
const BOOL_ATTRS = ["pupils", "eyebrows", "mouth", "gradient", "rarity"] as const;

/** "true"/"" means on, "false" means off, absent means auto (decided by the seed). */
function readBool(el: Element, name: string): boolean | undefined {
  if (!el.hasAttribute(name)) return undefined;
  return el.getAttribute(name) !== "false";
}

function readNumber(el: Element, name: string): number | undefined {
  const v = el.getAttribute(name);
  if (v === null || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * `<identicon-avatar seed="0xabc..." variant="face" size="64" radius="round">`
 *
 * Attributes: seed, variant ("face" or "pixel", default "face"), size (px,
 * default 64), radius (0 to 0.5, or "round"), tile, hair, grid, padding,
 * density, pupils, eyebrows, mouth, gradient, rarity (true/false), label,
 * decorative.
 *
 * Accessibility: the host is role="img" with aria-label from `label`
 * (default "Avatar"). The seed is never used as the label, since a wallet
 * address read aloud is noise. Add `decorative` when a name sits next to it.
 */
export class IdenticonAvatar extends HTMLElement {
  static observedAttributes = [
    "seed", "variant", "size", "radius", "tile", "hair", "label", "decorative",
    ...NUMBER_ATTRS, ...BOOL_ATTRS,
  ];

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
    const opts: AvatarOptions = {
      style: this.getAttribute("variant") === "pixel" ? "pixel" : "face",
      radius: radiusAttr === "round" ? 0.5 : readNumber(this, "radius"),
      tile: (this.getAttribute("tile") as TileShape | null) ?? undefined,
      hair: (this.getAttribute("hair") as HairStyle | null) ?? undefined,
    };
    for (const n of NUMBER_ATTRS) (opts as Record<string, unknown>)[n] = readNumber(this, n);
    for (const b of BOOL_ATTRS) {
      const key = b === "eyebrows" ? "eyebrows" : b;
      (opts as Record<string, unknown>)[key] = readBool(this, b);
    }
    return opts;
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
