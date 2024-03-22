import * as esbuild from "esbuild";

import * as fs from "node:fs/promises";
import { spawn } from "node:child_process";

console.log("cargo build --target=wasm32-unknown-unknown --release");
const cargo = spawn(
  "cargo",
  ["build", "--target=wasm32-unknown-unknown", "--release"],
  {
    cwd: "computer",
  },
);

cargo.stdout.on("data", (d) => {
  console.log(d.toString());
});
cargo.stderr.on("data", (d) => {
  console.error(d.toString());
});

await new Promise((resolve, reject) => {
  cargo.on("close", (code) => {
    if (code === 0) {
      resolve();
    } else {
      reject(`cargo exited with status ${code}`);
    }
  });
});

console.log("rm -r ./build/");
await fs.rm("./build/", {
  recursive: true,
  force: true,
});

const buildOutput = await esbuild.build({
  entryPoints: ["src/script.ts", "public/style.css"],
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
  metafile: true,
});

const outputs = Object.keys(buildOutput.metafile.outputs).map((o) => {
  const m = o.match(
    /^build\/(?<name>[^-]+)(?<hash>-[A-Z0-9]{8})(?<ext>\..+)/,
  ).groups;
  return [`${m.name}${m.ext}`, `${m.name}${m.hash}${m.ext}`];
});

console.log(outputs);

console.log("cat public/index.html");
let html = await fs.readFile("public/index.html", {
  encoding: "utf8",
});
for (const [orig, hashed] of outputs) {
  html = html.replace(orig, hashed);
}

console.log("cat > build/index.html");
await fs.writeFile("build/index.html", html);
