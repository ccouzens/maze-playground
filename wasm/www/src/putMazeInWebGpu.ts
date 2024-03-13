import { type Computer, type Maze } from "./index";

function render(
  context: GPUCanvasContext,
  device: GPUDevice,
  pipeline: GPURenderPipeline,
  setScale: (x: number, y: number) => void,
  uniformBuffer: GPUBuffer,
  uniformValues: Float32Array,
  bindGroup: GPUBindGroup,
) {
  const aspect = context.canvas.width / context.canvas.height;
  setScale(0.5 / aspect, 0.5);

  device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

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
  pass.setBindGroup(0, bindGroup);
  pass.draw(3);
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

  const uniformBuffer = device.createBuffer({
    size: 32,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformValues = new Float32Array(uniformBuffer.size / 4);
  uniformValues.set([0, 1, 0, 1], 0); // set the color
  uniformValues.set([-0.5, -0.25], 6); // set the offset

  const shaderCode = await fetch("./shader-LATEST.wgsl").then((r) => r.text());
  const module = device.createShaderModule({
    label: "shader from example",
    code: shaderCode,
  });

  const pipeline = await device.createRenderPipelineAsync({
    label: "example pipeline",
    layout: "auto",
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

  render(
    context,
    device,
    pipeline,
    function setScale(scaleX, scaleY) {
      uniformValues.set([scaleX, scaleY], 4);
    },
    uniformBuffer,
    uniformValues,
    bindGroup,
  );
}
