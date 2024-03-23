import { Renderer } from "./type";

interface State {
  url: string | null;
  image: HTMLImageElement;
}

export const image: Renderer<State> = {
  init() {
    const image = document.querySelector<HTMLImageElement>("#image")!;
    return Promise.resolve({ image, url: null });
  },

  async render({ imageBitmapFactory }, { image, url: oldUrl }) {
    const imageBitmap = await imageBitmapFactory();
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const context = canvas.getContext("bitmaprenderer")!;
    context.transferFromImageBitmap(imageBitmap);
    const blob = await canvas.convertToBlob();
    const url = URL.createObjectURL(blob);
    image.src = url;
    image.classList.add("canvas-ready");
    if (oldUrl !== null) {
      URL.revokeObjectURL(oldUrl);
    }
  },
};
