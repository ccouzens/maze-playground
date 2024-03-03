import { type Computer, type Maze } from "./index";

export async function putMazeInWebGPU(_computer: Computer, _maze: Maze) {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    console.log("WebGPU is not supported");
    return;
  }
  const canvas = document.querySelector<HTMLCanvasElement>("#webgpu")!;
  const context = canvas.getContext("webgpu");
  if (!context) {
    console.log("WebGPU is not supported");
    return;
  }
  context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
  });
}
