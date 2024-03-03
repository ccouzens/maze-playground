import { putMazeInWebgl } from "./putMazeInWebgl";

declare const tag: unique symbol;
export type Maze = number & { readonly [tag]: "MAZE" };
type RustString = number & { readonly [tag]: "RUST_STRING" };

export interface Computer {
  memory: WebAssembly.Memory;
  new_maze: (width: number, height: number) => Maze;
  free_maze: (maze: Maze) => void;
  string_ptr: (str: RustString) => number;
  string_length: (str: RustString) => number;
  free_string: (str: RustString) => void;
  maze_width: (maze: Maze) => number;
  maze_height: (maze: Maze) => number;
  maze_walls_ptr: (maze: Maze) => number;
  maze_walls_length: (maze: Maze) => number;
  maze_svg_path: (maze: Maze) => RustString;
}

async function initializeComputer(): Promise<Computer> {
  let computer: Computer;
  const wasm = await WebAssembly.instantiateStreaming(
    fetch("./computer-LATEST.wasm"),
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

export async function putMazeOnPage() {
  const computer = await initializeComputer();
  const maze = computer.new_maze(10, 10);
  try {
    await Promise.all([
      putMazeInWebgl(computer, maze),
      putMazeInSvg(computer, maze),
    ]);
  } finally {
    computer.free_maze(maze);
  }
}
