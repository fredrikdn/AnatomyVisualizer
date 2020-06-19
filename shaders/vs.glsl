#version 300 es


in vec3 inPosition;
in vec3 inNormal;
in vec2 inUV;

uniform mat4 pMatrix; 
uniform mat4 nMatrix;     //matrix to transform normals

out vec2 fsUV;


void main() {;
  fsUV = inUV;
  gl_Position = pMatrix * vec4(inPosition, 1.0);
}