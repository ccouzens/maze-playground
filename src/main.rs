mod maze;
use maze::Maze;

fn generate_maze_with_binary_tree_algorithm(
    rng: &mut impl rand::Rng,
    width: usize,
    height: usize,
) -> Maze {
    let mut maze = Maze::new(width, height).unwrap();
    for (x, y) in maze.every_cell() {
        match (x == width - 1, y == 0) {
            (true, true) => {}
            (false, true) => {
                maze.connect_pair(x, 0, x + 1, 0);
            }
            (true, false) => {
                maze.connect_pair(x, y, x, y - 1);
            }
            (false, false) => {
                let go_up = rng.gen();
                maze.connect_pair(
                    x,
                    y,
                    x + if go_up { 0 } else { 1 },
                    y - if go_up { 1 } else { 0 },
                );
            }
        }
    }

    maze
}

fn generate_maze_with_sidewinder_algorithm(
    rng: &mut impl rand::Rng,
    width: usize,
    height: usize,
) -> Maze {
    let mut maze = Maze::new(width, height).unwrap();

    for x in 0..width - 1 {
        maze.connect_pair(x, 0, x + 1, 0);
    }

    for y in 1..height {
        let mut block_start = 0;
        for x in 0..width {
            let extend = x != width - 1 && rng.gen();
            if extend {
                maze.connect_pair(x, y, x + 1, y);
            } else {
                let up_cell = rng.gen_range(block_start..=x);
                maze.connect_pair(up_cell, y, up_cell, y - 1);
                block_start = x + 1;
            }
        }
    }

    maze
}

fn main() {
    let maze = generate_maze_with_binary_tree_algorithm(&mut rand::thread_rng(), 10, 10);
    println!("{}\n", maze.as_block_printer());
    let maze = generate_maze_with_sidewinder_algorithm(&mut rand::thread_rng(), 10, 10);
    println!("{}", maze.as_block_printer());
}
