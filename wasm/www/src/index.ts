declare const tag: unique symbol;
export type Maze = number & { readonly [tag]: "MAZE" };
export type RustString = number & { readonly [tag]: "RUST_STRING" };
export type RustVecU8 = number & { readonly [tag]: "RUST_VEC" };
export type BitmapRenderer = number & { readonly [tag]: "BITMAP_RENDERER" };

interface Computer {
  memory: WebAssembly.Memory;
  new_maze: (width: number, height: number) => Maze;
  free_maze: (maze: Maze) => void;
  string_ptr: (str: RustString) => number;
  string_length: (str: RustString) => number;
  free_string: (str: RustString) => void;
  vec_u8_ptr: (str: RustVecU8) => number;
  vec_u8_length: (str: RustVecU8) => number;
  free_vec_u8: (str: RustVecU8) => void;
  maze_width: (maze: Maze) => number;
  maze_height: (maze: Maze) => number;
  maze_svg_path: (maze: Maze) => RustString;
  maze_to_block_string: (maze: Maze) => RustString;
  maze_to_drawing_string: (maze: Maze) => RustString;
  maze_to_bitmap_renderer: (maze: Maze) => BitmapRenderer;
  bitmap_renderer_width: (bitmapRenderer: BitmapRenderer) => number;
  bitmap_renderer_height: (bitmapRenderer: BitmapRenderer) => number;
  bitmap_renderer_to_bitmap: (bitmapRenderer: BitmapRenderer) => RustVecU8;
  free_bitmap_renderer: (bitmapRenderer: BitmapRenderer) => void;
}

async function initializeComputer(): Promise<Computer> {
  let computer: Computer;
  const wasm = await WebAssembly.instantiateStreaming(
    fetch("./computer.wasm"),
    {
      random: {
        fill_bytes(offset: number, length: number) {
          const bytes = new Uint8Array(computer.memory.buffer, offset, length);
          crypto.getRandomValues(bytes);
        },
      },
    },
  );
  computer = wasm.instance.exports as unknown as Computer;
  return computer;
}

function rustStringToJS(computer: Computer, rustString: RustString): string {
  const ptr = computer.string_ptr(rustString);
  const length = computer.string_length(rustString);
  const bytes = new Uint8Array(computer.memory.buffer, ptr, length);
  const jsString = new TextDecoder().decode(bytes);
  computer.free_string(rustString);
  return jsString;
}

function putMazeInSvg(computer: Computer, maze: Maze) {
  const svg = document.querySelector<SVGElement>("#svg")!;
  svg.setAttribute(
    "viewBox",
    `-1 -1 ${computer.maze_width(maze) + 2} ${computer.maze_height(maze) + 2}`,
  );
  const svgPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path",
  );
  svgPath.setAttribute(
    "d",
    rustStringToJS(computer, computer.maze_svg_path(maze)),
  );
  svg.append(svgPath);
}

function putMazeInPre(computer: Computer, maze: Maze) {
  const stringBlockPre =
    document.querySelector<HTMLPreElement>("#stringBlock")!;
  stringBlockPre.textContent = rustStringToJS(
    computer,
    computer.maze_to_block_string(maze),
  );

  const stringBoxDrawingPre =
    document.querySelector<HTMLPreElement>("#stringBoxDrawing")!;
  stringBoxDrawingPre.textContent = rustStringToJS(
    computer,
    computer.maze_to_drawing_string(maze),
  );
}

async function putMazeInMaskImage(computer: Computer, maze: Maze) {
  const bitmapRenderer = computer.maze_to_bitmap_renderer(maze);
  const bitmapRendererCanvas = new OffscreenCanvas(
    computer.bitmap_renderer_width(bitmapRenderer),
    computer.bitmap_renderer_height(bitmapRenderer),
  );
  const bitmapRendererContext =
    bitmapRendererCanvas.getContext("bitmaprenderer")!;
  const bitmapVec = computer.bitmap_renderer_to_bitmap(bitmapRenderer);

  bitmapRendererContext.transferFromImageBitmap(
    await createImageBitmap(
      new ImageData(
        new Uint8ClampedArray(
          computer.memory.buffer,
          computer.vec_u8_ptr(bitmapVec),
          computer.vec_u8_length(bitmapVec),
        ),
        computer.bitmap_renderer_width(bitmapRenderer),
        computer.bitmap_renderer_height(bitmapRenderer),
      ),
    ),
  );
  computer.free_vec_u8(bitmapVec);
  const bitmapBlob = await bitmapRendererCanvas.convertToBlob();
  const bitmapUrl = URL.createObjectURL(bitmapBlob);
  const bitmapRendererMask = document.getElementById("bitmapRendererMask")!;
  bitmapRendererMask.style.maskImage = `url(${bitmapUrl})`;

  computer.free_bitmap_renderer(bitmapRenderer);
}

export async function putMazeOnPage() {
  const computer = await initializeComputer();
  const maze = computer.new_maze(10, 10);

  putMazeInSvg(computer, maze);
  putMazeInPre(computer, maze);
  await putMazeInMaskImage(computer, maze);
  computer.free_maze(maze);
}
