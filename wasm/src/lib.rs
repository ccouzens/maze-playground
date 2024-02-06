use maze_playground::maze::Maze;
use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen(js_name = Maze)]
pub struct WasmMaze(Maze);

#[wasm_bindgen(js_class=Maze)]
impl WasmMaze {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize) -> Self {
        WasmMaze(
            maze_playground::maze::generators::generate_maze_with_sidewinder_algorithm(
                &mut rand::thread_rng(),
                width,
                height,
            ),
        )
    }

    #[wasm_bindgen(getter)]
    pub fn width(&self) -> usize {
        self.0.width()
    }

    #[wasm_bindgen(getter)]
    pub fn height(&self) -> usize {
        self.0.height()
    }

    pub fn walls_pointer(&self) -> *const bool {
        self.0.walls().as_ptr()
    }

    #[wasm_bindgen(js_name = toString)]
    pub fn to_string(&self) -> String {
        format!("{}", self.0.as_block_printer())
    }

    #[wasm_bindgen(js_name = toBoxDrawingString)]
    pub fn to_box_drawing_string(&self) -> String {
        format!("{}", self.0.as_box_drawing_printer())
    }

    pub fn to_svg_path(&self, scale_x: f64, scale_y: f64) -> String {
        self.0.to_svg_path(scale_x, scale_y)
    }

    pub fn to_bitmap(&self) -> WasmBitmap {
        let renderer = self.0.as_bitmap_printer();
        WasmBitmap {
            data: renderer.to_bitmap(),
            width: renderer.width(),
            height: renderer.height(),
        }
    }
}

#[wasm_bindgen(js_name = Bitmap)]
pub struct WasmBitmap {
    data: Vec<u8>,
    width: usize,
    height: usize,
}

#[wasm_bindgen(js_class=Bitmap)]
impl WasmBitmap {
    pub fn width(&self) -> usize {
        self.width
    }

    pub fn height(&self) -> usize {
        self.height
    }

    pub fn bitmap(&self) -> Vec<u8> {
        self.data.clone()
    }
}
