use std::collections::BTreeSet;

use super::Maze;

pub fn generate_maze_with_binary_tree_algorithm(
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

pub fn generate_maze_with_sidewinder_algorithm(
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

fn random_neighbour(
    rng: &mut impl rand::Rng,
    x: usize,
    y: usize,
    width: usize,
    height: usize,
) -> (usize, usize) {
    let mut candidates = [None; 4];
    let mut len = 0;
    if x > 0 {
        candidates[0] = Some((x - 1, y));
        len += 1;
    }
    if y > 0 {
        candidates[1] = Some((x, y - 1));
        len += 1;
    }
    if x + 1 < width {
        candidates[2] = Some((x + 1, y));
        len += 1;
    }
    if y + 1 < height {
        candidates[3] = Some((x, y + 1));
        len += 1;
    }
    candidates
        .iter()
        .filter_map(|c| *c)
        .nth(rng.gen_range(0..len))
        .unwrap()
}

pub fn generate_maze_with_aldous_broder(
    rng: &mut impl rand::Rng,
    width: usize,
    height: usize,
) -> Maze {
    let mut maze = Maze::new(width, height).unwrap();
    let mut visited = BTreeSet::new();

    let mut cell = (rng.gen_range(0..width), rng.gen_range(0..height));

    visited.insert(cell);

    while visited.len() != width * height {
        let next_cell = random_neighbour(rng, cell.0, cell.1, width, height);
        if visited.insert(next_cell) {
            maze.connect_pair(cell.0, cell.1, next_cell.0, next_cell.1);
        }
        cell = next_cell;
    }
    maze
}

pub fn generate_maze_with_wilsons_algorithm(
    rng: &mut impl rand::Rng,
    width: usize,
    height: usize,
) -> Maze {
    let mut maze = Maze::new(width, height).unwrap();
    let mut unvisited: BTreeSet<(usize, usize)> = maze.every_cell().collect();
    let first = *unvisited
        .iter()
        .nth(rng.gen_range(0..unvisited.len()))
        .unwrap();
    unvisited.remove(&first);

    while !unvisited.is_empty() {
        let mut cell = *unvisited
            .iter()
            .nth(rng.gen_range(0..unvisited.len()))
            .unwrap();
        let mut path = vec![cell];
        while unvisited.contains(&cell) {
            cell = random_neighbour(rng, cell.0, cell.1, width, height);
            if let Some(position) = path.iter().position(|&c| c == cell) {
                path.truncate(position + 1);
            } else {
                path.push(cell);
            }
        }

        for (a, b) in path.iter().zip(path.iter().skip(1)) {
            maze.connect_pair(a.0, a.1, b.0, b.1);
            unvisited.remove(a);
        }
    }

    maze
}
