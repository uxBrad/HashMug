import { createAvatar, type HairStyle, type TileShape } from "@sigil/core";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
let salt = 0;
const tri = (id: string): boolean | undefined => {
  const v = $<HTMLSelectElement>(id).value;
  return v === "" ? undefined : v === "on";
};

function render() {
  const prefix = $<HTMLInputElement>("prefix").value;
  const count = Number($<HTMLInputElement>("count").value);
  const opts = {
    style: $<HTMLSelectElement>("style").value as "face" | "pixel",
    mouth: tri("mouth"),
    pupils: tri("pupils"),
    eyebrows: tri("brows"),
    hair: ($<HTMLSelectElement>("hair").value || undefined) as HairStyle | undefined,
    gradient: $<HTMLSelectElement>("gradient").value === "" ? undefined : $<HTMLSelectElement>("gradient").value === "on",
    grid: Number($<HTMLSelectElement>("gridsize").value),
    tile: $<HTMLSelectElement>("tile").value as TileShape,
    radius: Number($<HTMLInputElement>("radius").value),
    padding: Number($<HTMLInputElement>("padding").value),
    density: Number($<HTMLInputElement>("density").value),
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
