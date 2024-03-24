import computerFile from "../computer/target/wasm32-unknown-unknown/release/computer.wasm";
import { imageBitmap, type Computer } from "./computer";
import { svg } from "./renderers/svg";
import { image } from "./renderers/image";
import { bitmapRenderer } from "./renderers/bitmapRenderer";
import { webGL } from "./renderers/webGL";
import { webGPU } from "./renderers/webGPU";
import { type RenderProps, type InitRenderer } from "./renderers/type";

async function initializeComputer(): Promise<Computer> {
  let computer: Computer;
  const wasm = await WebAssembly.instantiateStreaming(fetch(computerFile), {
    random: {
      fill_bytes(offset: number, length: number) {
        const bytes = new Uint8Array(computer.memory.buffer, offset, length);
        crypto.getRandomValues(bytes);
      },
    },
  });
  computer = wasm.instance.exports as unknown as Computer;
  return computer;
}

export async function putMazeOnPage() {
  const initRenderers: [string, InitRenderer][] = [
    ["webGPU", webGPU],
    ["svg", svg],
    ["image", image],
    ["bitmapRenderer", bitmapRenderer],
    ["webGL", webGL],
  ];
  const computer = await initializeComputer();
  const renderers: [string, (props: RenderProps) => Promise<void>][] = [];
  for (const [name, initRenderer] of initRenderers) {
    const start = performance.now();
    const renderer = await initRenderer();
    const end = performance.now();
    console.info("initialize timing", name, end - start);
    renderers.push([name, renderer]);
  }
  async function rerender() {
    const maze = computer.new_maze(10, 10);
    try {
      const bitmap = await imageBitmap(computer, maze);
      const props = {
        computer,
        maze,
        imageBitmapFactory() {
          return createImageBitmap(bitmap);
        },
      };
      for (const [name, renderer] of renderers) {
        const start = performance.now();
        await renderer(props);
        const end = performance.now();
        console.info("render timing", name, end - start);
      }
    } finally {
      computer.free_maze(maze);
    }
    setTimeout(rerender, 2000);
  }
  await rerender();
}
