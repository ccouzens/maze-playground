pub mod maze;
use maze::{printers::BitmapRenderer, Maze};
pub struct WasmMaze(Maze);

#[link(wasm_import_module = "random")]
extern "C" {
    fn fill_bytes(offset: *mut u8, length: usize);
}

struct JSRand();

impl rand::RngCore for JSRand {
    fn next_u32(&mut self) -> u32 {
        rand_core::impls::next_u32_via_fill(self)
    }

    fn next_u64(&mut self) -> u64 {
        rand_core::impls::next_u64_via_fill(self)
    }

    fn fill_bytes(&mut self, dest: &mut [u8]) {
        unsafe { fill_bytes(dest.as_mut_ptr(), dest.len()) }
    }

    fn try_fill_bytes(&mut self, dest: &mut [u8]) -> Result<(), rand::Error> {
        self.fill_bytes(dest);
        Ok(())
    }
}

#[no_mangle]
pub extern "C" fn new_maze(width: usize, height: usize) -> &'static mut Maze {
    let maze = maze::generators::generate_maze_with_wilsons_algorithm(&mut JSRand(), width, height);
    Box::leak(Box::new(maze))
}

#[no_mangle]
pub extern "C" fn maze_width(maze: &Maze) -> usize {
    maze.width()
}

#[no_mangle]
pub extern "C" fn maze_height(maze: &Maze) -> usize {
    maze.height()
}

#[no_mangle]
pub extern "C" fn maze_walls_ptr(maze: &Maze) -> *const bool {
    maze.walls().as_ptr()
}

#[no_mangle]
pub extern "C" fn maze_walls_length(maze: &Maze) -> usize {
    maze.walls().len()
}

#[no_mangle]
pub unsafe extern "C" fn free_maze(maze: &mut Maze) {
    drop(Box::from_raw(maze))
}

#[no_mangle]
pub extern "C" fn maze_svg_path(maze: &Maze) -> &'static String {
    let path = maze.to_svg_path(maze.width() as f64, maze.height() as f64);
    Box::leak(Box::new(path))
}

#[no_mangle]
pub extern "C" fn string_ptr(string: &String) -> *const u8 {
    string.as_ptr()
}

#[no_mangle]
pub extern "C" fn string_length(string: &String) -> usize {
    string.len()
}

#[no_mangle]
pub unsafe extern "C" fn free_string(string: &mut String) {
    drop(Box::from_raw(string))
}

#[no_mangle]
pub extern "C" fn maze_to_bitmap_renderer(maze: &Maze) -> &'static BitmapRenderer {
    let b = maze.as_bitmap_printer();
    Box::leak(Box::new(b))
}

#[no_mangle]
pub unsafe extern "C" fn free_bitmap_renderer(bitmap: &mut BitmapRenderer) {
    drop(Box::from_raw(bitmap))
}

#[no_mangle]
pub extern "C" fn bitmap_renderer_width(bitmap: &BitmapRenderer) -> usize {
    bitmap.width()
}

#[no_mangle]
pub extern "C" fn bitmap_renderer_height(bitmap: &BitmapRenderer) -> usize {
    bitmap.height()
}

#[no_mangle]
pub extern "C" fn bitmap_renderer_to_bitmap(bitmap: &BitmapRenderer) -> &'static Vec<u8> {
    Box::leak(Box::new(bitmap.to_bitmap()))
}

#[no_mangle]
pub extern "C" fn vec_u8_ptr(vec: &Vec<u8>) -> *const u8 {
    vec.as_ptr()
}

#[no_mangle]
pub extern "C" fn vec_u8_length(vec: &Vec<u8>) -> usize {
    vec.len()
}

#[no_mangle]
pub unsafe extern "C" fn free_vec_u8(vec: &mut Vec<u8>) {
    drop(Box::from_raw(vec))
}
