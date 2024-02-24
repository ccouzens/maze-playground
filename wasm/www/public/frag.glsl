#version 300 es

precision highp float;

in vec2 v_pos;

uniform uvec2 u_dimensions;
uniform vec2 u_pixel_dimensions;
uniform float u_wall_size;
uniform float u_passage_size;
uniform sampler2D u_walls;

out vec4 outColour;

float horizontalWallIndex(uvec2 pos) {
  uint total = uint(2) * u_dimensions.x * u_dimensions.y - u_dimensions.x -
               u_dimensions.y;
  return float(pos.y - uint(1) + pos.x * (u_dimensions.y - uint(1))) /
         float(total);
}

float verticalWallIndex(uvec2 pos) {
  uint horizontalWallOffset = u_dimensions.x * (u_dimensions.y - uint(2));
  uint total = uint(2) * u_dimensions.x * u_dimensions.y - u_dimensions.x -
               u_dimensions.y;
  return float(horizontalWallOffset + pos.y + pos.x * u_dimensions.y) /
         float(total);
}

bool mazeDisplayedAsHorizontalWall(uvec2 pos) {
  return pos.y == uint(0) || pos.y == u_dimensions.y ||
         (pos.y > uint(0) && pos.y < u_dimensions.y &&
          texture(u_walls, vec2(horizontalWallIndex(pos), 0)).r != 0.0);
}

bool mazeDisplayedAsVerticalWall(uvec2 pos) {
  return (pos.x == uint(0) && pos.y + uint(1) != u_dimensions.y) ||
         (pos.x == u_dimensions.x && pos.y != uint(0)) ||
         (pos.x > uint(0) && pos.x < u_dimensions.x &&
          texture(u_walls, vec2(verticalWallIndex(pos), 0)).r != 0.0);
}

void main() {
  float cell_size = u_wall_size + u_passage_size;
  uvec2 normalized_pixel =
      uvec2((v_pos * vec2(1, -1) + 1.0) * u_pixel_dimensions * 0.5);
  uvec2 normalized_pos = uvec2(vec2(normalized_pixel) / cell_size);
  bvec2 in_wall =
      lessThan(mod(vec2(normalized_pixel), cell_size), vec2(u_wall_size));

  bool displayAsWall =
      all(in_wall) ||
      (in_wall.x && mazeDisplayedAsVerticalWall(normalized_pos)) ||
      (in_wall.y && mazeDisplayedAsHorizontalWall(normalized_pos));

  outColour = displayAsWall
                  ? vec4(1)
                  : vec4(vec2(normalized_pos) / vec2(u_dimensions), 0, 1);
}
