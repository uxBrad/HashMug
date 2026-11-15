import { Resvg, initWasm } from "@resvg/resvg-wasm";

let ready: Promise<void> | undefined;
type WasmSource = Parameters<typeof initWasm>[0];

/**
 * PNG rasterizer for runtimes without native code (Cloudflare Workers).
 * Pass the compiled wasm module: in a Worker, `import wasm from
 * "@resvg/resvg-wasm/index_bg.wasm"`. In Node, pass the file bytes.
 */
export function createWasmRasterizer(wasm: WasmSource | Promise<WasmSource>) {
  return async (svg: string, size: number): Promise<Uint8Array> => {
    // resvg-wasm allows one initialization per process, so it is shared.
    ready ??= Promise.resolve(wasm).then((w) => initWasm(w));
    await ready;
    const px = Math.min(2048, Math.max(8, Math.round(size)));
    return new Resvg(svg, { fitTo: { mode: "width", value: px } }).render().asPng();
  };
}
