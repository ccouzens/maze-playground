import { type Computer, type Maze } from "./index";

export async function putMazeInWebGPU(_computer: Computer, _maze: Maze) {
  const device = await navigator.gpu
    ?.requestAdapter()
    .then((adapter) => adapter?.requestDevice());
  if (device === undefined) {
    console.log("WebGPU is not supported");
    return;
  }

  const shaderCode = await fetch("./compute-LATEST.wgsl").then((r) => r.text());
  const module = device.createShaderModule({
    label: "shader from example",
    code: shaderCode,
  });

  const pipeline = await device.createComputePipelineAsync({
    label: "example pipeline",
    layout: "auto",
    compute: {
      module,
      entryPoint: "computeSomething",
    },
  });

  const input = new Float32Array([1, 3, 5]);

  const workBuffer = device.createBuffer({
    label: "work buffer",
    size: input.byteLength,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(workBuffer, 0, input);

  const resultBuffer = device.createBuffer({
    label: "result buffer",
    size: input.byteLength,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  const bindGroup = device.createBindGroup({
    label: "bindGroup for work buffer",
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: workBuffer } }],
  });

  const encoder = device.createCommandEncoder({ label: "doubling encoder" });
  const pass = encoder.beginComputePass({ label: "doubling compute pass" });
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(input.length);
  pass.end();

  encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);

  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);

  await resultBuffer.mapAsync(GPUMapMode.READ);
  const result = new Float32Array(resultBuffer.getMappedRange());

  console.log({ input, result: [...result] });

  resultBuffer.unmap();
}
