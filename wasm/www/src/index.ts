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
  maze_walls_ptr: (maze: Maze) => number;
  maze_walls_length: (maze: Maze) => number;
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

function mazeWalls(computer: Computer, maze: Maze): Uint8Array {
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
  try {
    const bitmapRendererCanvas = new OffscreenCanvas(
      computer.bitmap_renderer_width(bitmapRenderer),
      computer.bitmap_renderer_height(bitmapRenderer),
    );
    const bitmapRendererContext =
      bitmapRendererCanvas.getContext("bitmaprenderer")!;
    const bitmapVec = computer.bitmap_renderer_to_bitmap(bitmapRenderer);
    try {
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
    } finally {
      computer.free_vec_u8(bitmapVec);
    }
    const bitmapBlob = await bitmapRendererCanvas.convertToBlob();
    const bitmapUrl = URL.createObjectURL(bitmapBlob);
    const bitmapRendererMask = document.getElementById("bitmapRendererMask")!;
    bitmapRendererMask.style.maskImage = `url(${bitmapUrl})`;
  } finally {
    computer.free_bitmap_renderer(bitmapRenderer);
  }
}

async function putMazeInWebgl(computer: Computer, maze: Maze) {
  const canvas = document.querySelector<HTMLCanvasElement>("#webgl2");
  const gl = canvas?.getContext("webgl2");
  if (!gl) {
    return;
  }
  gl.VERTEX_SHADER;

  async function fetchAndCreateFunction(
    gl: WebGL2RenderingContext,
    type:
      | WebGLRenderingContext["VERTEX_SHADER"]
      | WebGLRenderingContext["FRAGMENT_SHADER"],
    filename: string,
  ) {
    const response = await fetch(filename);
    if (!response.ok) {
      throw `Unexpected response ${response.status} ${response.statusText}`;
    }
    const source = await response.text();

    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    }

    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw `Could not compile shader ${filename}`;
  }

  const [fragmentShader, vertexShader] = await Promise.all([
    fetchAndCreateFunction(gl, gl.FRAGMENT_SHADER, "./maze.frag"),
    fetchAndCreateFunction(gl, gl.VERTEX_SHADER, "./maze.vert"),
  ]);

  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw `Could not compile program`;
  }
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  const dimensionsUniformLocation = gl.getUniformLocation(
    program,
    "u_dimensions",
  );
  const pixelDimensionsUniformLocation = gl.getUniformLocation(
    program,
    "u_pixel_dimensions",
  );
  const wallSizeUniformLocation = gl.getUniformLocation(program, "u_wall_size");
  const passageSizeUniformLocation = gl.getUniformLocation(
    program,
    "u_passage_size",
  );

  const wallsUniformLocation = gl.getUniformLocation(program, "u_walls");
  const walls = mazeWalls(computer, maze);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  const mazeDimensions: [number, number] = [
    computer.maze_width(maze),
    computer.maze_height(maze),
  ];
  const texture = gl.createTexture()!;
  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.R8,
    walls.length,
    1,
    0,
    gl.RED,
    gl.UNSIGNED_BYTE,
    walls,
  );
  const WALL_SIZE = 1;
  const PASSAGE_SIZE = 3;
  const pixelDimensions: [number, number] = [
    mazeDimensions[0] * (WALL_SIZE + PASSAGE_SIZE) + WALL_SIZE,
    mazeDimensions[1] * (WALL_SIZE + PASSAGE_SIZE) + WALL_SIZE,
  ];
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniform2ui(
    dimensionsUniformLocation,
    mazeDimensions[0],
    mazeDimensions[1],
  );
  gl.uniform1f(wallSizeUniformLocation, WALL_SIZE);
  gl.uniform1f(passageSizeUniformLocation, PASSAGE_SIZE);
  gl.uniform2f(
    pixelDimensionsUniformLocation,
    pixelDimensions[0],
    pixelDimensions[1],
  );
  gl.uniform1i(wallsUniformLocation, 0);
  gl.viewport(
    0,
    0,
    gl.canvas.width,
    gl.canvas.height,
    // mazeDimensions[0] * (WALL_SIZE + PASSAGE_SIZE) + WALL_SIZE,
    // mazeDimensions[1] * (WALL_SIZE + PASSAGE_SIZE) + WALL_SIZE,
  );
  gl.bindVertexArray(vao);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

export async function putMazeOnPage() {
  const computer = await initializeComputer();
  const maze = computer.new_maze(10, 10);
  try {
    putMazeInSvg(computer, maze);
    putMazeInPre(computer, maze);
    await putMazeInMaskImage(computer, maze);
    await putMazeInWebgl(computer, maze);
  } finally {
    computer.free_maze(maze);
  }
}
