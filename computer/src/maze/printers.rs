use super::Maze;
mod bitmap;
pub use bitmap::BitmapRenderer;

pub struct BlockPrinter<'a> {
    pub maze: &'a Maze,
}

impl std::fmt::Display for BlockPrinter<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        for y in 0..self.maze.height * 2 + 1 {
            for x in 0..self.maze.width * 2 + 1 {
                match (x % 2 == 0, y % 2 == 0) {
                    (true, true) => {
                        write!(f, "█")?;
                    }
                    (false, false) => {
                        write!(f, " ")?;
                    }
                    (false, true) => {
                        write!(
                            f,
                            "{}",
                            if self.maze.displayed_as_horizontal_wall(x / 2, y / 2) {
                                '█'
                            } else {
                                ' '
                            }
                        )?;
                    }
                    (true, false) => {
                        write!(
                            f,
                            "{}",
                            if self.maze.displayed_as_vertical_wall(x / 2, y / 2) {
                                '█'
                            } else {
                                ' '
                            }
                        )?;
                    }
                }
            }
            writeln!(f)?;
        }
        Ok(())
    }
}

pub struct BoxDrawingPrinter<'a> {
    pub maze: &'a Maze,
}

impl std::fmt::Display for BoxDrawingPrinter<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        for y in 0..self.maze.height * 2 + 1 {
            let effective_y = y / 2;
            for x in 0..self.maze.width * 2 + 1 {
                let effective_x = x / 2;
                match (x % 2 == 0, y % 2 == 0) {
                    (true, true) => {
                        let above = effective_y
                            .checked_sub(1)
                            .map(|y| self.maze.displayed_as_vertical_wall(effective_x, y))
                            .unwrap_or(false);
                        let right = self
                            .maze
                            .displayed_as_horizontal_wall(effective_x, effective_y);
                        let below = self
                            .maze
                            .displayed_as_vertical_wall(effective_x, effective_y);
                        let left = effective_x
                            .checked_sub(1)
                            .map(|x| self.maze.displayed_as_horizontal_wall(x, effective_y))
                            .unwrap_or(false);
                        write!(
                            f,
                            "{}",
                            match (above, right, below, left) {
                                (true, true, true, true) => '┼',
                                (true, true, true, false) => '├',
                                (true, true, false, true) => '┴',
                                (true, true, false, false) => '└',
                                (true, false, true, true) => '┤',
                                (true, false, true, false) => '│',
                                (true, false, false, true) => '┘',
                                (true, false, false, false) => '╵',
                                (false, true, true, true) => '┬',
                                (false, true, true, false) => '┌',
                                (false, true, false, true) => '─',
                                (false, true, false, false) => '╶',
                                (false, false, true, true) => '┐',
                                (false, false, true, false) => '╷',
                                (false, false, false, true) => '╴',
                                (false, false, false, false) => ' ',
                            }
                        )?;
                    }
                    (false, false) => {
                        write!(f, " ")?;
                    }
                    (false, true) => {
                        write!(
                            f,
                            "{}",
                            if self
                                .maze
                                .displayed_as_horizontal_wall(effective_x, effective_y)
                            {
                                '─'
                            } else {
                                ' '
                            }
                        )?;
                    }
                    (true, false) => {
                        write!(
                            f,
                            "{}",
                            if self
                                .maze
                                .displayed_as_vertical_wall(effective_x, effective_y)
                            {
                                '│'
                            } else {
                                ' '
                            }
                        )?;
                    }
                }
            }
            writeln!(f)?;
        }
        Ok(())
    }
}
