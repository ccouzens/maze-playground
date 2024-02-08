use super::Maze;

const WALL: [u8; 4] = [255, 255, 255, 255];
const PASSAGE: [u8; 4] = [0, 0, 0, 0];

pub struct BitmapRenderer<'a> {
    pub maze: &'a Maze,
}

impl BitmapRenderer<'_> {
    pub fn to_bitmap(&self) -> Vec<u8> {
        let mut bitmap = Vec::new();

        for y in 0..self.height() {
            for x in 0..self.width() {
                bitmap.extend(match (x % 2 == 0, y % 2 == 0) {
                    (true, true) => WALL,
                    (false, false) => PASSAGE,
                    (false, true) => {
                        if self.maze.displayed_as_horizontal_wall(x / 2, y / 2) {
                            WALL
                        } else {
                            PASSAGE
                        }
                    }
                    (true, false) => {
                        if self.maze.displayed_as_vertical_wall(x / 2, y / 2) {
                            WALL
                        } else {
                            PASSAGE
                        }
                    }
                });
            }
        }

        bitmap
    }

    pub fn width(&self) -> usize {
        self.maze.width * 2 + 1
    }
    pub fn height(&self) -> usize {
        self.maze.height * 2 + 1
    }
}
