import { type Computer, type Maze } from "./index";

export async function putMazeInWebGPU(_computer: Computer, _maze: Maze) {
  const device = await navigator.gpu
    ?.requestAdapter()
    .then((adapter) => adapter?.requestDevice());
  if (!device) {
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
  context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
  });
}
