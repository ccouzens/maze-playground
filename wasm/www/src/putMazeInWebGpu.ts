import { type Computer, type Maze } from "./index";

function render(
  context: GPUCanvasContext,
  device: GPUDevice,
  pipeline: GPURenderPipeline,
) {
  const encoder = device.createCommandEncoder({ label: "our encoder" });
  const pass = encoder.beginRenderPass({
    label: "our basic canvas renderPass",
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
  pass.draw(4);
  pass.end();

  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
}

export async function putMazeInWebGPU(_computer: Computer, _maze: Maze) {
  const device = await navigator.gpu
    ?.requestAdapter()
    .then((adapter) => adapter?.requestDevice());
  if (device === undefined) {
    console.log("WebGPU is not supported");
    return;
  }
  const context = document
    .querySelector<HTMLCanvasElement>("#webgpu")
    ?.getContext("webgpu");
  if (!context) {
    console.log("WebGPU is not supported");
    return;
  }
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format: presentationFormat,
  });

  context.canvas.width = 41;
  context.canvas.height = 41;

  const shaderCode = await fetch("./shader-LATEST.wgsl").then((r) => r.text());
  const module = device.createShaderModule({
    label: "shader from example",
    code: shaderCode,
  });

  const pipeline = await device.createRenderPipelineAsync({
    label: "example pipeline",
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

  render(context, device, pipeline);
}
