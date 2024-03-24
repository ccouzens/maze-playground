import { type InitRenderer } from "./type";

export const image: InitRenderer = function initImage() {
  const image = document.querySelector<HTMLImageElement>("#image")!;
  const blobUrls: string[] = [];
  return Promise.resolve(async function renderImage({ imageBitmapFactory }) {
    const imageBitmap = await imageBitmapFactory();
    const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const context = canvas.getContext("bitmaprenderer")!;
    context.transferFromImageBitmap(imageBitmap);
    const blob = await canvas.convertToBlob();
    const url = URL.createObjectURL(blob);
    image.src = url;
    image.classList.add("canvas-ready");
    while (blobUrls.length > 0) {
      URL.revokeObjectURL(blobUrls.pop()!);
    }
    blobUrls.push(url);
  });
};
