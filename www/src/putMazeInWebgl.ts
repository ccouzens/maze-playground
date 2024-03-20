import { type Computer, type Maze, mazeWalls } from "./index";

async function fetchAndCreateShader(
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

export async function putMazeInWebgl(computer: Computer, maze: Maze) {
  const canvas = document.querySelector<HTMLCanvasElement>("#webgl2");
  const gl = canvas?.getContext("webgl2");
  if (!gl) {
    return;
  }

  const [fragmentShader, vertexShader] = await Promise.all([
    fetchAndCreateShader(gl, gl.FRAGMENT_SHADER, "./frag-LATEST.glsl"),
    fetchAndCreateShader(gl, gl.VERTEX_SHADER, "./vert-LATEST.glsl"),
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
  gl.canvas.width = mazeDimensions[0] * (WALL_SIZE + PASSAGE_SIZE) + WALL_SIZE;
  gl.canvas.height = mazeDimensions[1] * (WALL_SIZE + PASSAGE_SIZE) + WALL_SIZE;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.bindVertexArray(vao);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  canvas?.classList.add("canvas-ready");
}
