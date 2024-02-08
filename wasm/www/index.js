import { Maze } from "../pkg";

const m = new Maze(10, 10);

const svg = document.getElementById("svg");
svg.setAttribute("viewBox", `-1 -1 ${m.width + 2} ${m.height + 2}`);
const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
svgPath.setAttribute("d", m.to_svg_path(m.width, m.height));
svg.append(svgPath);

const stringBlockPre = document.getElementById("stringBlock");
stringBlockPre.textContent = m.toString();

const stringBoxDrawingPre = document.getElementById("stringBoxDrawing");
stringBoxDrawingPre.textContent = m.toBoxDrawingString();

const bitmap = m.to_bitmap();
const bitmapRendererCanvas = new OffscreenCanvas(
  bitmap.width(),
  bitmap.height(),
);
const bitmapRendererContext = bitmapRendererCanvas.getContext("bitmaprenderer");
bitmapRendererContext.transferFromImageBitmap(
  await createImageBitmap(
    new ImageData(
      new Uint8ClampedArray(bitmap.bitmap()),
      bitmap.width(),
      bitmap.height(),
    ),
  ),
);
bitmap.free();
const bitmapBlob = await bitmapRendererCanvas.convertToBlob();
const bitmapUrl = URL.createObjectURL(bitmapBlob);
const bitmapRendererMask = document.getElementById("bitmapRendererMask");
bitmapRendererMask.style.maskImage = `url(${bitmapUrl})`;
