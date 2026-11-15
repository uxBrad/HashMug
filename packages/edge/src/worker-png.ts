// @ts-expect-error wrangler resolves .wasm imports to a compiled WebAssembly.Module
import wasm from "@resvg/resvg-wasm/index_bg.wasm";
import { createApp } from "./app";
import { createWasmRasterizer } from "./wasm-png";

/** Cloudflare Worker entry with PNG support (resvg compiled to WebAssembly). */
export default createApp({ rasterize: createWasmRasterizer(wasm) });
