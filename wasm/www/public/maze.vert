#version 300 es
 
in vec4 a_position;

out vec2 v_pos;
 
void main() {
  gl_Position = a_position;

  v_pos = a_position.xy;
}
