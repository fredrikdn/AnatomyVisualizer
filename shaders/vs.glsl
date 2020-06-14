#version 300 es
#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1

layout(location = POSITION_LOCATION) in vec3 inPosition;
layout(location = NORMAL_LOCATION) in vec3 inNormal;

uniform mat4 matrix; 
uniform mat4 nMatrix;     //matrix to transform normals

out vec3 fsNormal;

void main() {
  fsNormal = mat3(nMatrix) * inNormal; 
  gl_Position = matrix * vec4(inPosition, 1.0);
}