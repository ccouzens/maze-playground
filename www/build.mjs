import * as esbuild from "esbuild";

import * as fs from "node:fs/promises";

console.log("rm -r ./build/");
await fs.rm("./build/", {
  recursive: true,
  force: true,
});

// console.log("mkdir ./build");
// await fs.mkdir("./build");

await esbuild.build({
  entryPoints: ["src/index.ts", "public/style.css"],
  bundle: true,
  loader: {
    ".wasm": "file",
    ".glsl": "file",
    ".wgsl": "file",
  },
  assetNames: "../build/[name]-[hash]",
  entryNames: "[name]-[hash]",
  minify: true,
  sourcemap: true,
  outdir: "./build",
  logLevel: "info",
});

// await esbuild.build({
//   entryPoints: ["public/style.css"],
//   bundle: true,
//   assetNames: "../build/[name]-[hash]",
//   entryNames: "[dir]/[name]-[hash]",
//   minify: true,
//   sourcemap: true,
//   outfile: "build/style.css",
//   logLevel: "info",
// });

console.log("cp public/index.html ./build/");
