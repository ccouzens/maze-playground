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

function measureSync<T>(name: string[], callback: () => T): T {
  const start = performance.now();
  const out = callback();
  const end = performance.now();
  console.info(...name, end - start);
  return out;
}

async function measureAsync<T>(
  name: string[],
  callback: () => Promise<T>,
): Promise<T> {
  const start = performance.now();
  const out = await callback();
  const end = performance.now();
  console.info(...name, end - start);
  return out;
}

export async function putMazeOnPage() {
  const initRenderers: [string, InitRenderer][] = [
    ["webGPU", webGPU],
    ["svg", svg],
    ["image", image],
    ["bitmapRenderer", bitmapRenderer],
    ["webGL", webGL],
  ];
  const computer = await measureAsync(
    ["initializeComputer"],
    initializeComputer,
  );
  const renderers: [string, (props: RenderProps) => Promise<void>][] = [];
  for (const [name, initRenderer] of initRenderers) {
    const renderer = await measureAsync(
      ["initilize timing", name],
      initRenderer,
    );
    renderers.push([name, renderer]);
  }
  async function rerender() {
    const maze = measureSync(["new maze"], () => computer.new_maze(30, 30));
    try {
      const bitmap = await measureAsync(["image bitmap"], () =>
        imageBitmap(computer, maze),
      );
      const props = {
        computer,
        maze,
        imageBitmapFactory() {
          return createImageBitmap(bitmap);
        },
      };
      for (const [name, renderer] of renderers) {
        measureAsync(["render timing", name], () => renderer(props));
      }
    } finally {
      computer.free_maze(maze);
    }
    setTimeout(rerender, 2000);
  }
  await rerender();
}
