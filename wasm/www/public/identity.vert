#version 300 es
 
in vec4 a_position;

out vec2 v_pos;
 
void main() {
  gl_Position = a_position;

  v_pos = vec2(a_position[0], a_position[1]);
}
