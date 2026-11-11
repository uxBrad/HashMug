import { createAvatar, type TileShape } from "@sigil/core";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
let salt = 0;

function render() {
  const prefix = $<HTMLInputElement>("prefix").value;
  const count = Number($<HTMLInputElement>("count").value);
  const opts = {
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
