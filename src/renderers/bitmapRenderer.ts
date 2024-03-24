import { type InitRenderer } from "./type";

export const bitmapRenderer: InitRenderer = function initBitmapRenderer() {
  const canvas = document.querySelector<HTMLCanvasElement>("#bitmapRenderer")!;
  const context = canvas.getContext("bitmaprenderer")!;

  return Promise.resolve(async function renderBitmapRenderer({
    imageBitmapFactory,
  }) {
    const imageBitmap = await imageBitmapFactory();
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    context.transferFromImageBitmap(imageBitmap);
    canvas.classList.add("canvas-ready");
  });
};
