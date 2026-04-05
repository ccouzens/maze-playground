#version 300 es

precision highp float;

in vec2 v_pos;

uniform uvec2 u_dimensions;
uniform vec2 u_pixel_dimensions;
uniform float u_wall_size;
uniform float u_passage_size;
uniform sampler2D u_walls;

out vec4 outColour;

bool mazeDisplayedAsHorizontalWall(uvec2 pos, vec2 texture_index) {
  return pos.y == uint(0) || pos.y == u_dimensions.y ||
         (pos.y > uint(0) && pos.y < u_dimensions.y &&
          texture(u_walls, vec2(texture_index.x, 0)).r != 0.0);
}

bool mazeDisplayedAsVerticalWall(uvec2 pos, vec2 texture_index) {
  return (pos.x == uint(0) && pos.y + uint(1) != u_dimensions.y) ||
         (pos.x == u_dimensions.x && pos.y != uint(0)) ||
         (pos.x > uint(0) && pos.x < u_dimensions.x &&
          texture(u_walls, vec2(texture_index.y, 0)).r != 0.0);
}

void main() {
  float cell_size = u_wall_size + u_passage_size;
  uvec2 normalized_pixel =
      uvec2((v_pos * vec2(1, -1) + 1.0) * u_pixel_dimensions * 0.5);
  uvec2 normalized_pos = uvec2(vec2(normalized_pixel) / cell_size);
  bvec2 in_wall =
      lessThan(mod(vec2(normalized_pixel), cell_size), vec2(u_wall_size));

  vec2 texture_index =
      (vec2(float(normalized_pos.y - uint(1) +
                  normalized_pos.x * (u_dimensions.y - uint(1))),
            float((u_dimensions.x * (u_dimensions.y - uint(2))) +
                  normalized_pos.y + normalized_pos.x * u_dimensions.y)) +
       vec2(0.5)) /
      float(uint(2) * u_dimensions.x * u_dimensions.y - u_dimensions.x -
            u_dimensions.y);

  bvec2 wall_at_pos =
      bvec2(mazeDisplayedAsVerticalWall(normalized_pos, texture_index),
            mazeDisplayedAsHorizontalWall(normalized_pos, texture_index));

  bool displayAsWall = all(in_wall) || (in_wall.x && wall_at_pos.x) ||
                       (in_wall.y && wall_at_pos.y);

  outColour = displayAsWall ? vec4(vec3(0), 1) : vec4(1);
}
