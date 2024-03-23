import { mazeWalls, type Computer, type Maze } from "./computer";
import shaderFile from "../public/shader.wgsl";

const WALLSIZE: [number, number] = [1, 1];
const CELLSIZE: [number, number] = [4, 4];

function render(
  context: GPUCanvasContext,
  device: GPUDevice,
  pipeline: GPURenderPipeline,
  bindGroup: GPUBindGroup,
) {
  const encoder = device.createCommandEncoder({ label: "maze encoder" });
  const pass = encoder.beginRenderPass({
    label: "maze renderPass",
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        clearValue: [0.3, 0.3, 0.3, 1],
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.draw(4);
  pass.end();

  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
}

export async function putMazeInWebGPU(computer: Computer, maze: Maze) {
  const canvas = document.querySelector<HTMLCanvasElement>("#webgpu")!;
  const dimensions: [number, number] = [
    computer.maze_width(maze),
    computer.maze_height(maze),
  ];

  canvas.width = dimensions[0] * CELLSIZE[0] + WALLSIZE[0];
  canvas.height = dimensions[1] * CELLSIZE[1] + WALLSIZE[1];

  const wallData = mazeWalls(computer, maze);

  const mazeStructValues = new ArrayBuffer(
    24 + wallData.length + 4 - (wallData.length % 4),
  );
  const mazeStructViews = {
    dimensions: new Uint32Array(mazeStructValues, 0, 2),
    wall_size: new Uint32Array(mazeStructValues, 8, 2),
    cell_size: new Uint32Array(mazeStructValues, 16, 2),
    walls: new Uint8Array(mazeStructValues, 24),
  };
  mazeStructViews.dimensions.set(dimensions);
  mazeStructViews.wall_size.set(WALLSIZE);
  mazeStructViews.cell_size.set(CELLSIZE);
  mazeStructViews.walls.set(wallData);

  const device = await navigator.gpu
    ?.requestAdapter()
    .then((adapter) => adapter?.requestDevice());
  if (device === undefined) {
    console.log("WebGPU is not supported");
    return;
  }
  const context = canvas.getContext("webgpu");
  if (!context) {
    console.log("WebGPU is not supported");
    return;
  }
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: presentationFormat,
  });

  const uniformBuffer = device.createBuffer({
    size: mazeStructValues.byteLength,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });

  const shaderCode = await fetch(shaderFile).then((r) => r.text());
  const module = device.createShaderModule({
    label: "maze shader",
    code: shaderCode,
  });

  const pipeline = await device.createRenderPipelineAsync({
    label: "maze pipeline",
    layout: "auto",
    primitive: { topology: "triangle-strip" },
    vertex: {
      module,
      entryPoint: "vs",
    },
    fragment: {
      module,
      entryPoint: "fs",
      targets: [{ format: presentationFormat }],
    },
  });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
  });

  device.queue.writeBuffer(uniformBuffer, 0, mazeStructValues);

  render(context, device, pipeline, bindGroup);
  canvas?.classList.add("canvas-ready");
}
