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
  bool x_in_wall = mod((v_pos.x + 1.0) * u_pixel_dimensions.x * 0.5, cell_size) < u_wall_size;
  bool y_in_wall = mod((v_pos.y + 1.0) * u_pixel_dimensions.y * 0.5, cell_size) < u_wall_size;

  if ((v_pos.y + 1.0)/2.0 <= 0.1) {
    outColour = texture(u_walls, vec2(v_pos.x, 0))*256.0;
    return;
  }
  
  outColour = vec4(x_in_wall || y_in_wall ? 1.0 : v_pos.x, x_in_wall || y_in_wall ? 1.0 : v_pos.y, 1.0, 1);
}
