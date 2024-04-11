import computerFile from "../public/computer.wasm";
declare const tag: unique symbol;
export type Maze = number & { readonly [tag]: "MAZE" };
type RustString = number & { readonly [tag]: "RUST_STRING" };
type RustVecU8 = number & { readonly [tag]: "RUST_VEC_U8" };
type BitmapRenderer = number & { readonly [tag]: "BITMAP_RENDERER" };

export interface Computer {
  memory: WebAssembly.Memory;
  new_maze_wilsons: (width: number, height: number) => Maze;
  new_maze_aldous_broder: (width: number, height: number) => Maze;
  new_maze_binary_tree: (width: number, height: number) => Maze;
  new_maze_sidewinder: (width: number, height: number) => Maze;
  free_maze: (maze: Maze) => void;
  string_ptr: (str: RustString) => number;
  string_length: (str: RustString) => number;
  free_string: (str: RustString) => void;
  vec_u8_ptr: (str: RustVecU8) => number;
  vec_u8_length: (str: RustVecU8) => number;
  free_vec_u8: (str: RustVecU8) => void;
  maze_width: (maze: Maze) => number;
  maze_height: (maze: Maze) => number;
  maze_walls_ptr: (maze: Maze) => number;
  maze_walls_length: (maze: Maze) => number;
  maze_walls_svg_path: (maze: Maze) => RustString;
  maze_path_svg_path: (maze: Maze) => RustString;
  maze_to_bitmap_renderer: (maze: Maze) => BitmapRenderer;
  bitmap_renderer_width: (bitmapRenderer: BitmapRenderer) => number;
  bitmap_renderer_height: (bitmapRenderer: BitmapRenderer) => number;
  bitmap_renderer_to_bitmap: (bitmapRenderer: BitmapRenderer) => RustVecU8;
  free_bitmap_renderer: (bitmapRenderer: BitmapRenderer) => void;
}

export async function initializeComputer(): Promise<Computer> {
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

export function rustStringToJS(
  computer: Computer,
  rustString: RustString,
): string {
  try {
    const ptr = computer.string_ptr(rustString);
    const length = computer.string_length(rustString);
    const bytes = new Uint8Array(computer.memory.buffer, ptr, length);
    const jsString = new TextDecoder().decode(bytes);
    return jsString;
  } finally {
    computer.free_string(rustString);
  }
}

export function mazeWalls(computer: Computer, maze: Maze): Uint8Array {
  const ptr = computer.maze_walls_ptr(maze);
  const length = computer.maze_walls_length(maze);
  return new Uint8Array(computer.memory.buffer, ptr, length);
}

export async function imageBitmap(
  computer: Computer,
  maze: Maze,
): Promise<ImageBitmap> {
  const bitmapRenderer = computer.maze_to_bitmap_renderer(maze);
  try {
    const bitmapVec = computer.bitmap_renderer_to_bitmap(bitmapRenderer);
    try {
      const dataArray = new Uint8ClampedArray(
        computer.memory.buffer,
        computer.vec_u8_ptr(bitmapVec),
        computer.vec_u8_length(bitmapVec),
      );
      const imageData = new ImageData(
        dataArray,
        computer.bitmap_renderer_width(bitmapRenderer),
        computer.bitmap_renderer_height(bitmapRenderer),
      );
      return await createImageBitmap(imageData);
    } finally {
      computer.free_vec_u8(bitmapVec);
    }
  } finally {
    computer.free_bitmap_renderer(bitmapRenderer);
  }
}
