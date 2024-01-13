/// A rectangular grid of cells with passageways or walls connecting or isolating them in the 4 cardinal directions
///
/// The top left corner cell has coordinates x=0, y=0.
/// The top right corner cell has coordinates x=width-1, y=0.
/// The bottom left corner cell has coordinates x=0, y=height-1.
/// The bottom right corner cell has coordinates x=width-1, y=height-1.
struct Maze {
    width: usize,
    height: usize,

    /// Array of bools representing walls. `true` is a wall. `false` is a passage.
    ///
    /// Walls are indexed as per below. There are `width * (height -1)` horizontal walls and `(width -1) * height` vertical walls for a total of `2 * width * height - width - height`.
    ///
    /// ```text
    /// ┌───┬───┬───┐
    /// │   │   │   │
    /// │   6   9   │
    /// ├─0─┬─2─┬─4─┤
    /// │   │   │   │
    /// │   7  10   │
    /// ├─1─┬─3─┬─5─┤
    /// │   │   │   │
    /// │   8  11   │
    /// └───┴───┴───┘
    /// ```
    walls: Vec<bool>,
}

use thiserror::Error;

#[derive(Error, Debug)]
pub enum MazeNewError {
    #[error("inputs exceed index")]
    Large,
}

impl Maze {
    fn new(width: usize, height: usize) -> Result<Self, MazeNewError> {
        if width == 0 || height == 0 {
            return Ok(Self {
                width: 0,
                height: 0,
                walls: vec![],
            });
        }
        let wall_size = usize::checked_add(
            usize::checked_mul(width, height - 1).ok_or(MazeNewError::Large)?,
            usize::checked_mul(width - 1, height).ok_or(MazeNewError::Large)?,
        )
        .ok_or(MazeNewError::Large)?;

        Ok(Self {
            width,
            height,
            walls: vec![true; wall_size],
        })
    }

    fn as_block_printer(&self) -> BlockPrinter {
        BlockPrinter { maze: self }
    }

    fn wall_index_between(
        &self,
        cell_a_x: usize,
        cell_a_y: usize,
        cell_b_x: usize,
        cell_b_y: usize,
    ) -> Option<usize> {
        if cell_a_x >= self.width
            || cell_b_x >= self.width
            || cell_a_y >= self.height
            || cell_b_y >= self.height
        {
            return None;
        }
        if cell_a_x == cell_b_x {
            // Down from cell a
            if cell_a_y + 1 == cell_b_y {
                return Some(cell_a_y + cell_a_x * (self.height - 1));
            }
            // Up from cell a
            if cell_a_y == cell_b_y + 1 {
                return Some(cell_b_y + cell_a_x * (self.height - 1));
            }
        }

        if cell_a_y == cell_b_y {
            let horizontal_wall_offset = self.width * (self.height - 1);
            // Right from cell a
            if cell_a_x + 1 == cell_b_x {
                return Some(horizontal_wall_offset + cell_a_y + cell_a_x * self.height);
            }
            // Left from cell a
            if cell_a_x == cell_b_x + 1 {
                return Some(horizontal_wall_offset + cell_a_y + cell_b_x * self.height);
            }
        }
        None
    }

    fn is_connected_pair(
        &self,
        cell_a_x: usize,
        cell_a_y: usize,
        cell_b_x: usize,
        cell_b_y: usize,
    ) -> bool {
        let wall_index = self.wall_index_between(cell_a_x, cell_a_y, cell_b_x, cell_b_y);
        match wall_index {
            None => false,
            Some(i) => !self.walls[i],
        }
    }

    fn connect_pair(
        &mut self,
        cell_a_x: usize,
        cell_a_y: usize,
        cell_b_x: usize,
        cell_b_y: usize,
    ) -> bool {
        let wall_index = self.wall_index_between(cell_a_x, cell_a_y, cell_b_x, cell_b_y);
        match wall_index {
            None => false,
            Some(i) => {
                self.walls[i] = false;
                true
            }
        }
    }

    fn every_cell(&self) -> impl Iterator<Item = (usize, usize)> {
        let width = self.width;
        let height = self.height;

        (0..(width * height)).map(move |i| (i % width, i / width))
    }
}

struct BlockPrinter<'a> {
    maze: &'a Maze,
}

impl std::fmt::Display for BlockPrinter<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        for y in 0..self.maze.height {
            for x in 0..self.maze.width {
                write!(f, "█")?;
                write!(
                    f,
                    "{}",
                    if y == 0 || !self.maze.is_connected_pair(x, y - 1, x, y) {
                        '█'
                    } else {
                        ' '
                    }
                )?;
            }
            writeln!(f, "█")?;
            for x in 0..self.maze.width {
                write!(
                    f,
                    "{}",
                    if (x == 0 || !self.maze.is_connected_pair(x - 1, y, x, y))
                        && !(x == 0 && y == self.maze.height - 1)
                    {
                        '█'
                    } else {
                        ' '
                    }
                )?;
                write!(f, " ")?;
            }
            writeln!(f, "{}", if y == 0 { ' ' } else { '█' })?;
        }
        for _x in 0..self.maze.width {
            write!(f, "██")?;
        }
        write!(f, "█")
    }
}

#[cfg(test)]
mod test {
    use super::Maze;

    #[test]
    fn test_print_horizontal_zig() {
        let expected = r"
███████
█   █  
█ █ █ █
  █   █
███████"
            .trim();

        let mut maze = Maze::new(3, 2).unwrap();
        maze.connect_pair(0, 1, 0, 0);
        maze.connect_pair(0, 0, 1, 0);
        maze.connect_pair(1, 0, 1, 1);
        maze.connect_pair(1, 1, 2, 1);
        maze.connect_pair(2, 1, 2, 0);
        assert_eq!(expected, format!("{}", maze.as_block_printer()));
    }
}

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
