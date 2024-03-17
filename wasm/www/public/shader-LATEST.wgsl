struct MazeStruct {
  dimensions: vec2<u32>,
  wall_size: vec2<u32>,
  cell_size: vec2<u32>,
  // walls: array<u32>,
};

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

const walls32 = array(16777472, 65792, 65536, 16777217, 256, 16842753, 16842752, 16777473, 256, 1, 16842752, 16777473, 16842753, 65537, 16777473, 16777217, 257, 16843008, 16843008, 65536, 65793, 1, 16777216, 16777472, 256, 16777472, 65536, 1, 257, 65792, 16777216, 65537, 0, 65793, 65793, 65537, 256, 256, 16777216, 16842752, 65536, 16843008, 0, 16777216, 65537);

fn is_wall_at_index(index: u32) -> bool {
  let wall_int = walls32[index / 4];
  let shift_positions = (index % 4) * 8;
  return ((wall_int >> shift_positions) & 1) != 0;
}

@fragment fn fs(@builtin(position) position: vec4f) -> @location(0) vec4f {
  const maze = MazeStruct(vec2<u32>(10, 10), vec2<u32>(1, 1), vec2<u32>(4, 4));

  let cell_pos = vec2<u32>(position.xy) / maze.cell_size;
  let in_wall = vec2<u32>(position.xy) % maze.cell_size < maze.wall_size; 

  let array_index = vec2<u32>(
    cell_pos.y - 1 + cell_pos.x * (maze.dimensions.y - 1),
    maze.dimensions.x * (maze.dimensions.y - 2) + cell_pos.y + cell_pos.x * maze.dimensions.y
  );

  let wall_at_cell = vec2(
    (cell_pos.x == 0 && cell_pos.y + 1 != maze.dimensions.y )
      || (cell_pos.x == maze.dimensions.x && cell_pos.y != 0)
      || is_wall_at_index(array_index.y),
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
