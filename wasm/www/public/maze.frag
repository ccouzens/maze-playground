#version 300 es
 
precision highp float;

in vec2 v_pos;
 
out vec4 outColour;
 
void main() {
  bool grid = int((v_pos.x + 1.0) * 100.0) % 20 == 0 ||  int((v_pos.y + 1.0) * 100.0) % 20 == 0;
  outColour = vec4(grid ? 1.0 : v_pos.x, grid ? 1.0 : v_pos.y, 1.0, 1);
}
