pub mod maze;
use maze::{Maze, printers::BitmapRenderer};

#[link(wasm_import_module = "random")]
unsafe extern "C" {
    fn fill_bytes(offset: *mut u8, length: usize);
}

struct JSRand();

impl rand::TryRng for JSRand {
    type Error = core::convert::Infallible;

    fn try_next_u32(&mut self) -> Result<u32, Self::Error> {
        rand_core::utils::next_word_via_fill(self)
    }

    fn try_next_u64(&mut self) -> Result<u64, Self::Error> {
        rand_core::utils::next_word_via_fill(self)
    }

    fn try_fill_bytes(&mut self, dest: &mut [u8]) -> Result<(), Self::Error> {
        unsafe { fill_bytes(dest.as_mut_ptr(), dest.len()) }
        Ok(())
    }
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn new_maze_wilsons(width: usize, height: usize) -> &'static mut Maze {
    let maze = maze::generators::generate_maze_with_wilsons_algorithm(&mut JSRand(), width, height);
    Box::leak(Box::new(maze))
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn new_maze_aldous_broder(width: usize, height: usize) -> &'static mut Maze {
    let maze = maze::generators::generate_maze_with_aldous_broder(&mut JSRand(), width, height);
    Box::leak(Box::new(maze))
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn new_maze_binary_tree(width: usize, height: usize) -> &'static mut Maze {
    let maze =
        maze::generators::generate_maze_with_binary_tree_algorithm(&mut JSRand(), width, height);
    Box::leak(Box::new(maze))
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn new_maze_sidewinder(width: usize, height: usize) -> &'static mut Maze {
    let maze =
        maze::generators::generate_maze_with_sidewinder_algorithm(&mut JSRand(), width, height);
    Box::leak(Box::new(maze))
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn maze_width(maze: &Maze) -> usize {
    maze.width()
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn maze_height(maze: &Maze) -> usize {
    maze.height()
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn maze_is_solved(maze: &Maze) -> bool {
    maze.is_solved()
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn maze_walls_ptr(maze: &Maze) -> *const bool {
    maze.walls().as_ptr()
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn maze_walls_length(maze: &Maze) -> usize {
    maze.walls().len()
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn free_maze(maze: &mut Maze) {
    drop(unsafe { Box::from_raw(maze) })
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn maze_walls_svg_path(maze: &Maze) -> &'static String {
    let path = maze.walls_to_svg_path(maze.width() as f64, maze.height() as f64);
    Box::leak(Box::new(path))
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn maze_path_svg_path(maze: &Maze) -> &'static String {
    let path = maze.path_to_svg_path(maze.width() as f64, maze.height() as f64);
    Box::leak(Box::new(path))
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn string_ptr(string: &String) -> *const u8 {
    string.as_ptr()
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn string_length(string: &String) -> usize {
    string.len()
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn free_string(string: &mut String) {
    drop(unsafe { Box::from_raw(string) })
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn maze_move_to(maze: &mut Maze, x: usize, y: usize) -> bool {
    maze.move_to_cell(x, y)
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn maze_move_direction(maze: &mut Maze, direction: u32) -> bool {
    maze.move_direction(direction)
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn maze_to_bitmap_renderer(maze: &'_ Maze) -> &'static BitmapRenderer<'_> {
    let b = maze.as_bitmap_printer();
    Box::leak(Box::new(b))
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn free_bitmap_renderer(bitmap: &mut BitmapRenderer) {
    drop(unsafe { Box::from_raw(bitmap) })
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn bitmap_renderer_width(bitmap: &BitmapRenderer) -> usize {
    bitmap.width()
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn bitmap_renderer_height(bitmap: &BitmapRenderer) -> usize {
    bitmap.height()
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn bitmap_renderer_to_bitmap(bitmap: &BitmapRenderer) -> &'static Vec<u8> {
    Box::leak(Box::new(bitmap.to_bitmap()))
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn vec_u8_ptr(vec: &Vec<u8>) -> *const u8 {
    vec.as_ptr()
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn vec_u8_length(vec: &Vec<u8>) -> usize {
    vec.len()
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn free_vec_u8(vec: &mut Vec<u8>) {
    drop(unsafe { Box::from_raw(vec) })
}
