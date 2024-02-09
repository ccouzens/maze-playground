import wasm from "../../target/wasm32-unknown-unknown/release/wasm.wasm";

const computer = await WebAssembly.instantiateStreaming(fetch(wasm), {
  random: {
    fill_bytes(offset, length) {
      const bytes = new Uint8Array(
        computer.instance.exports.memory.buffer,
        offset,
        length,
      );
      crypto.getRandomValues(bytes);
    },
  },
});

const m = computer.instance.exports.new_maze(10, 10);

function rustStringToJS(rustString) {
  const ptr = computer.instance.exports.string_ptr(rustString);
  const length = computer.instance.exports.string_length(rustString);
  const bytes = new Uint8Array(
    computer.instance.exports.memory.buffer,
    ptr,
    length,
  );
  const jsString = new TextDecoder().decode(bytes);
  computer.instance.exports.free_string(rustString);
  return jsString;
}

const svg = document.getElementById("svg");
svg.setAttribute(
  "viewBox",
  `-1 -1 ${computer.instance.exports.maze_width(m) + 2} ${computer.instance.exports.maze_height(m) + 2}`,
);
const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
svgPath.setAttribute(
  "d",
  rustStringToJS(computer.instance.exports.maze_svg_path(m)),
);
svg.append(svgPath);

const stringBlockPre = document.getElementById("stringBlock");
stringBlockPre.textContent = rustStringToJS(
  computer.instance.exports.maze_to_block_string(m),
);

const stringBoxDrawingPre = document.getElementById("stringBoxDrawing");
stringBoxDrawingPre.textContent = rustStringToJS(
  computer.instance.exports.maze_to_drawing_string(m),
);

const bitmapRenderer = computer.instance.exports.maze_to_bitmap_renderer(m);
const bitmapRendererCanvas = new OffscreenCanvas(
  computer.instance.exports.bitmap_renderer_width(bitmapRenderer),
  computer.instance.exports.bitmap_renderer_height(bitmapRenderer),
);
const bitmapRendererContext = bitmapRendererCanvas.getContext("bitmaprenderer");
const bitmapVec =
  computer.instance.exports.bitmap_renderer_to_bitmap(bitmapRenderer);

bitmapRendererContext.transferFromImageBitmap(
  await createImageBitmap(
    new ImageData(
      new Uint8ClampedArray(
        computer.instance.exports.memory.buffer,
        computer.instance.exports.vec_u8_ptr(bitmapVec),
        computer.instance.exports.vec_u8_length(bitmapVec),
      ),
      computer.instance.exports.bitmap_renderer_width(bitmapRenderer),
      computer.instance.exports.bitmap_renderer_height(bitmapRenderer),
    ),
  ),
);
computer.instance.exports.free_vec_u8(bitmapVec);
const bitmapBlob = await bitmapRendererCanvas.convertToBlob();
const bitmapUrl = URL.createObjectURL(bitmapBlob);
const bitmapRendererMask = document.getElementById("bitmapRendererMask");
bitmapRendererMask.style.maskImage = `url(${bitmapUrl})`;

computer.instance.exports.free_bitmap_renderer(bitmapRenderer);
computer.instance.exports.free_maze(m);
