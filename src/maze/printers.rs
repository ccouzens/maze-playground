use super::Maze;

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
            for x in 0..self.maze.width * 2 + 1 {
                match (x % 2 == 0, y % 2 == 0) {
                    (true, true) => {
                        write!(f, "┼")?;
                    }
                    (false, false) => {
                        write!(f, " ")?;
                    }
                    (false, true) => {
                        write!(
                            f,
                            "{}",
                            if self.maze.displayed_as_horizontal_wall(x / 2, y / 2) {
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
                            if self.maze.displayed_as_vertical_wall(x / 2, y / 2) {
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
