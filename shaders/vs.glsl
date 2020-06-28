#version 300 es
#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1
#define UV_LOCATION 2

layout(location = POSITION_LOCATION) in vec3 inPosition;
layout(location = NORMAL_LOCATION) in vec3 inNormal;
layout(location = UV_LOCATION) in vec2 inUV;

uniform mat4 pMatrix; 
uniform mat4 nMatrix;     //matrix to transform normals

out vec2 fsUV;
out vec3 fsPos;
out vec3 fsNorm;

void main() {
  fsNorm = mat3(nMatrix) * inNormal;
  fsPos = inPosition;
  fsUV = inUV;
  gl_Position = pMatrix * vec4(inPosition, 1.0);
}