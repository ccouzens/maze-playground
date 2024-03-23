import { Renderer } from "./type";

interface State {
  canvas: HTMLCanvasElement;
  context: ImageBitmapRenderingContext;
}

export const bitmapRenderer: Renderer<State> = {
  init() {
    const canvas =
      document.querySelector<HTMLCanvasElement>("#bitmapRenderer")!;
    const context = canvas.getContext("bitmaprenderer")!;
    return Promise.resolve({ canvas, context });
  },

  async render({ imageBitmapFactory }, { canvas, context }) {
    const imageBitmap = await imageBitmapFactory();
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    context.transferFromImageBitmap(imageBitmap);
    canvas.classList.add("canvas-ready");
  },
};
