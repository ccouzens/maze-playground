import computerFile from "../computer/target/wasm32-unknown-unknown/release/computer.wasm";
import { imageBitmap, type Computer } from "./computer";
import { svg } from "./renderers/svg";
import { image } from "./renderers/image";
import { type RenderProps } from "./renderers/type";
import { bitmapRenderer } from "./renderers/bitmapRenderer";
import { webGL } from "./renderers/webGL";
import { webGPU } from "./renderers/webGPU";

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
  const [computer, renderFns] = await Promise.all([
    initializeComputer(),
    Promise.all(
      [svg, image, bitmapRenderer, webGL, webGPU].map(async (renderer) => {
        const state = await renderer.init();
        return (props: RenderProps) => renderer.render(props, state as any);
      }),
    ),
  ]);
  async function rerender() {
    const size = 8 + Math.random() * 5;
    const maze = computer.new_maze(size, size);
    try {
      const bitmapPromise = imageBitmap(computer, maze);
      async function imageBitmapFactory() {
        const image = await bitmapPromise;
        return createImageBitmap(image);
      }
      await Promise.all([
        bitmapPromise,
        ...renderFns.map((r) => r({ computer, maze, imageBitmapFactory })),
      ]);
    } finally {
      computer.free_maze(maze);
    }
    setTimeout(rerender, 2000);
  }
  await rerender();
}
