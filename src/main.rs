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
}

fn main() {
    println!("Hello, world!");
}
