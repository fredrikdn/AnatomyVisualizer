#version 300 es

precision mediump float;

in vec2 fsUV;

uniform vec3 mDiffColor;
uniform vec3 lightDirection;
uniform vec3 lightColor;
uniform mat4 lightDirMatrix;

uniform sampler2D uTexture;

out vec4 outColor;

void main() {
    outColor = texture(uTexture, fsUV);
}