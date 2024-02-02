use super::Maze;

pub struct BlockPrinter<'a> {
    pub maze: &'a Maze,
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

pub struct BoxDrawingPrinter<'a> {
    pub maze: &'a Maze,
}

impl std::fmt::Display for BoxDrawingPrinter<'_> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        // width is columns * 2 + 1
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
                            if self.maze.is_connected_pair(
                                x / 2,
                                (y / 2).saturating_sub(1),
                                x / 2,
                                y / 2
                            ) {
                                ' '
                            } else {
                                '─'
                            }
                        )?;
                    }
                    (true, false) => {
                        write!(
                            f,
                            "{}",
                            if self.maze.is_connected_pair(
                                (x / 2).saturating_sub(1),
                                y / 2,
                                x / 2,
                                y / 2
                            ) {
                                ' '
                            } else {
                                '│'
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
