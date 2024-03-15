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

  const cell_size = wall_size + passage_size;
  let cell_pos = vec2<u32>(position.xy) / cell_size;
  let in_wall = vec2<u32>(position.xy) % cell_size < wall_size; 

  let red = vec4f(0, vec2f(cell_pos)/vec2f(dimensions), 1);
  return select(red, vec4(1, 1, 1, 1), any(in_wall));
}
