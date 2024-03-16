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

@fragment fn fs(@builtin(position) position: vec4f) -> @location(0) vec4f {
  const dimensions = vec2<u32>(10, 10);
  const pixel_dimensions = vec2<u32>(41, 41);
  const wall_size = vec2<u32>(1, 1);
  const passage_size = vec2<u32>(3, 3);
  const walls = array(  0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0  );

  const cell_size = wall_size + passage_size;
  let cell_pos = vec2<u32>(position.xy) / cell_size;
  let in_wall = vec2<u32>(position.xy) % cell_size < wall_size; 

  let array_index = vec2<u32>(
    cell_pos.y - 1 + cell_pos.x * (dimensions.y - 1),
    dimensions.x * (dimensions.y - 2) + cell_pos.y + cell_pos.x * dimensions.y
  );

  let wall_at_cell = vec2(
    (cell_pos.x == 0 && cell_pos.y + 1 != dimensions.y )
      || (cell_pos.x == dimensions.x && cell_pos.y != 0)
      || walls[array_index.y] != 0,
    cell_pos.y == 0
      || cell_pos.y == dimensions.y
      || walls[array_index.x] != 0
  );

  let wall_at_pixel = all(in_wall) || any(in_wall & wall_at_cell);

  return select(
    vec4(vec2<f32>(cell_pos)/vec2<f32>(dimensions), 0, 1),
    vec4(1, 1, 1, 1),
    wall_at_pixel
  );
}
