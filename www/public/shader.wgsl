struct MazeStruct {
  dimensions: vec2<u32>,
  wall_size: vec2<u32>,
  cell_size: vec2<u32>,
  walls: array<u32>,
};

@group(0) @binding(0) var<storage, read> maze: MazeStruct;

@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32
) -> @builtin(position) vec4f {
  let pos = array(
    vec2f(-1, -1),
    vec2f(-1, 1),
    vec2f(1, -1),
    vec2f(1, 1)
  );

  return vec4f(
    pos[vertexIndex], 0.0, 1.0
  );
}

fn is_wall_at_index(index: u32) -> bool {
  let wall_int = maze.walls[index / 4];
  let shift_positions = (index % 4) * 8;
  return ((wall_int >> shift_positions) & 1) != 0;
}

@fragment fn fs(@builtin(position) position: vec4f) -> @location(0) vec4f {

  let cell_pos = vec2<u32>(position.xy) / maze.cell_size;
  let in_wall = vec2<u32>(position.xy) % maze.cell_size < maze.wall_size; 

  let array_index = vec2<u32>(
    cell_pos.y - 1 + cell_pos.x * (maze.dimensions.y - 1),
    maze.dimensions.x * (maze.dimensions.y - 2) + cell_pos.y + cell_pos.x * maze.dimensions.y
  );

  let wall_at_cell = vec2(
    (cell_pos.x == 0 && cell_pos.y + 1 != maze.dimensions.y )
      || (cell_pos.x == maze.dimensions.x && cell_pos.y != 0)
      || (cell_pos.x > 0 && cell_pos.x < maze.dimensions.x && is_wall_at_index(array_index.y)),
    cell_pos.y == 0
      || cell_pos.y == maze.dimensions.y
      || is_wall_at_index(array_index.x)
  );

  let wall_at_pixel = all(in_wall) || any(in_wall & wall_at_cell);

  return select(
    vec4<f32>(1, 1, 1, 1),
    vec4<f32>(0, 0, 0, 1),
    wall_at_pixel
  );
}
