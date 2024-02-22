#version 300 es

precision highp float;

in vec2 v_pos;

uniform uvec2 u_dimensions;
uniform vec2 u_pixel_dimensions;
uniform float u_wall_size;
uniform float u_passage_size;
uniform sampler2D u_walls;

out vec4 outColour;

void main() {
  float cell_size = u_wall_size + u_passage_size;
  uvec2 normalized_pixel =
      uvec2((v_pos * vec2(1, -1) + 1.0) * u_pixel_dimensions * 0.5);
  uvec2 normalized_pos = uvec2(vec2(normalized_pixel) / cell_size);
  bvec2 in_wall =
      lessThan(mod(vec2(normalized_pixel), cell_size), vec2(u_wall_size));

  // if ((v_pos.y + 1.0) / 2.0 <= 0.1) {
  //   outColour = texture(u_walls, vec2(v_pos.x, 0)) * 256.0;
  //   return;
  // }

  bool displayAsWall =
      all(in_wall) ||
      (in_wall.x && ((normalized_pos.x == uint(0) &&
                      normalized_pos.y + uint(1) != u_dimensions.y))

      );

  outColour = displayAsWall ? vec4(1, 0.75, 0.5, 1)
                            : vec4(0, vec2(normalized_pos) * 0.05, 1);
}
