#version 300 es

precision mediump float;

in vec2 fsUV;
in vec3 fsPos;
in vec3 fsNorm;

uniform vec3 mDiffColor;
uniform vec3 lightDirection;
uniform vec3 dirLightColor;

//uniform vec3 lightPosition;
//uniform vec3 posLightColor;

uniform sampler2D uTexture;

out vec4 outColor;

void main() {
    vec3 norm = normalize(fsNorm);
    //vec3 Ldir = normalize(lightPosition - fsPos); 
    
    vec3 lambertColor = mDiffColor*(dirLightColor * dot(-lightDirection, norm));
    
    vec4 texcol = texture(uTexture, fsUV);
    vec4 finalColor = vec4(clamp(lambertColor, 0.0, 1.0), 1.0);
    outColor = texcol+finalColor; 
}