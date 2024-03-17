use super::Maze;

const WALL: [u8; 4] = [0, 0, 0, 255];
const PASSAGE: [u8; 4] = [255; 4];
const WALL_SIZE: usize = 1;
const PASSAGE_SIZE: usize = 3;

pub struct BitmapRenderer<'a> {
    pub maze: &'a Maze,
}

impl BitmapRenderer<'_> {
    pub fn to_bitmap(&self) -> Vec<u8> {
        let mut bitmap = Vec::new();
        let width = self.width();
        let cell_size = WALL_SIZE + PASSAGE_SIZE;

        for y in 0..self.height() {
            for x in 0..width {
                let x_in_wall = x % cell_size < WALL_SIZE;
                let y_in_wall = y % cell_size < WALL_SIZE;
                let x_pos = x / cell_size;
                let y_pos = y / cell_size;
                bitmap.extend(match (x_in_wall, y_in_wall) {
                    (true, true) => WALL,
                    (false, false) => PASSAGE,
                    (false, true) => {
                        if self.maze.displayed_as_horizontal_wall(x_pos, y_pos) {
                            WALL
                        } else {
                            PASSAGE
                        }
                    }
                    (true, false) => {
                        if self.maze.displayed_as_vertical_wall(x_pos, y_pos) {
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
        self.maze.width * (WALL_SIZE + PASSAGE_SIZE) + WALL_SIZE
    }
    pub fn height(&self) -> usize {
        self.maze.height * (WALL_SIZE + PASSAGE_SIZE) + WALL_SIZE
    }
}
