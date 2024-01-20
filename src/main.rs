use maze_playground::maze::generators::{
    generate_maze_with_binary_tree_algorithm, generate_maze_with_sidewinder_algorithm,
};

fn main() {
    let maze = generate_maze_with_binary_tree_algorithm(&mut rand::thread_rng(), 10, 10);
    println!("{}\n", maze.as_block_printer());
    let maze = generate_maze_with_sidewinder_algorithm(&mut rand::thread_rng(), 10, 10);
    println!("{}", maze.as_block_printer());
}
