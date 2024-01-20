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
}
