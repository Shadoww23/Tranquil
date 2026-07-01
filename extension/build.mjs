import { build } from "esbuild";
import { mkdirSync, copyFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));
const dist = resolve(dir, "dist");

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

// Bundle the content script (which imports the shared scoring engine from
// ../../src/lib) into a single IIFE the browser can load directly.
await build({
  entryPoints: [resolve(dir, "src/content.ts")],
  bundle: true,
  format: "iife",
  target: "chrome110",
  outfile: resolve(dist, "content.js"),
  legalComments: "none",
  minify: process.argv.includes("--minify"),
});

copyFileSync(resolve(dir, "manifest.json"), resolve(dist, "manifest.json"));

console.log("Built extension → extension/dist");
