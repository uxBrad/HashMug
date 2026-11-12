// Internal overrides on purpose: the sandbox is for judging faces, with traits forced.
import { createFaceSvg as createAvatar, type HairStyle } from "@hashmug/core/internal";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
let salt = 0;

/** "auto" (empty) leaves the choice to the seed. */
const tri = (id: string): boolean | undefined => {
  const v = $<HTMLSelectElement>(id).value;
  return v === "" ? undefined : v === "on";
};

function render() {
  const prefix = $<HTMLInputElement>("prefix").value;
  const count = Number($<HTMLInputElement>("count").value);
  const opts = {
    radius: Number($<HTMLInputElement>("radius").value),
    hair: ($<HTMLSelectElement>("hair").value || undefined) as HairStyle | undefined,
    gradient: tri("gradient"),
    pupils: tri("pupils"),
    eyebrows: tri("brows"),
    mouth: tri("mouth"),
  };
  document.documentElement.style.setProperty("--cell", $<HTMLInputElement>("cell").value + "px");
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const seed = `${prefix}${salt}-${i}`;
    parts.push(`<div class="item">${createAvatar(seed, opts)}<span>${seed}</span></div>`);
  }
  $("grid").innerHTML = parts.join("");
}

document.querySelectorAll("input,select").forEach((el) => el.addEventListener("input", render));
$("shuffle").addEventListener("click", () => {
  salt++;
  render();
});
render();
