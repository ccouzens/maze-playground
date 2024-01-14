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
