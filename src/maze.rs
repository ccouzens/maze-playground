mod printers;
use printers::BlockPrinter;

pub mod generators;
/// A rectangular grid of cells with passageways or walls connecting or isolating them in the 4 cardinal directions
///
/// The top left corner cell has coordinates x=0, y=0.
/// The top right corner cell has coordinates x=width-1, y=0.
/// The bottom left corner cell has coordinates x=0, y=height-1.
/// The bottom right corner cell has coordinates x=width-1, y=height-1.
pub struct Maze {
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
    pub fn new(width: usize, height: usize) -> Result<Self, MazeNewError> {
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

    pub fn as_block_printer(&self) -> BlockPrinter {
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

    pub fn connect_pair(
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

    pub fn every_cell(&self) -> impl Iterator<Item = (usize, usize)> {
        let width = self.width;
        let height = self.height;

        (0..(width * height)).map(move |i| (i % width, i / width))
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