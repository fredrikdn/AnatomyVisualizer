// GLOBAL VAR
var gl;
var baseDir;
var shaderDir;
var assetsDir;
var programs = new Array();

// camera parameters - init position
var viewMatrix;
var cx = -2.0,
    cy = 2.0,
    cz = 2.0,
    elev = -40.0,
    ang = -40.0,
    roll = 0.01;

// keys and movement parameters
var keys = [],
    vx = 0.0,
    vy = 0.0,
    vz = 0.0,
    rvx = 0.0,
    rvy = 0.0,
    rvz = 0.0;

window.addEventListener("keyup", utils.keyFunctionUp, false);
window.addEventListener("keydown", utils.keyFunctionDown, false);

// --------------- Assets guide
// https://webgl2fundamentals.org/webgl/lessons/webgl-load-obj.html

console.log("app.js started");
// shaders -- sync
/*
var vs = `#version 300 es

in vec3 inPosition;
in vec3 inNormal;
out vec3 fsNormal;

uniform mat4 matrix; 
uniform mat4 nMatrix;     //matrix to transform normals

void main() {
  fsNormal = mat3(nMatrix) * inNormal; 
  gl_Position = matrix * vec4(inPosition, 1.0);
}`;

var fs = `#version 300 es

precision mediump float;

in vec3 fsNormal;
out vec4 outColor;

uniform vec3 mDiffColor;
uniform vec3 lightDirection; 
uniform vec3 lightColor;   

void main() {

  vec3 nNormal = normalize(fsNormal);
  vec3 lDir = lightDirection; 
  vec3 lambertColor = mDiffColor * lightColor * dot(-lDir,nNormal);
  outColor = vec4(clamp(lambertColor, 0.0, 1.0), 1.0);
}`;
*/
// Visualizer Main
function main() {
    utils.resizeCanvasToDisplaySize(gl.canvas);
    console.log("main() run");
    // Defining directional light
    var dirLightA = -utils.degToRad(60);
    var dirLightB = -utils.degToRad(120);
    var dirLight = [Math.cos(dirLightA) * Math.cos(dirLightB), Math.sin(dirLightA), Math.cos(dirLightA) * Math.sin(dirLightB)];
    var dirLightColor = [0.5, 0.5, 1.0];

    // PARAMETERS
    var positionAttributeLocation = new Array(),
        normalAttributeLocation = new Array();
    var matrixLocation = new Array(),
        materialDiffColorHandle = new Array();
    var lightDirectionHandle = new Array(),
        lightColorHandle = new Array();
    var normalMatrixPositionHandle = new Array();
    var materialDiffColorHandle = new Array();

    // ***** Instance MODELS & MATRICES *****

    // ***** Matrices *****
    // PERSPECTIVE
    var aspect = gl.canvas.width / gl.canvas.height;
    var perspProjectionMatrix = utils.MakePerspective(90.0, aspect, 0.1, 1000.0);

    // ***** Models *****
    // CUBE
    var cubeMaterialColor = [0.6, 0.5, 0.7];

    var cubeTx = 0.0,
        cubeTy = 0.0,
        cubeTz = 0.0,
        cubeRx = 0.0,
        cubeRy = 0.0,
        cubeRz = 0.0,
        cubeS = 1.0;
    var cubeWorld = utils.MakeWorld(cubeTx, cubeTy, cubeTz, cubeRx, cubeRy, cubeRz, cubeS);

    // SKELETJOHN



    // ---------------- REMOVE FOR ASYNC FUNCTION
    /*
    var canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }
    utils.resizeCanvasToDisplaySize(gl.canvas);
*/

    // Set GLOBAL states:
    // set viewport (Lower-left corner of the viewport, width, height)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // clearing BUFFERS
    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // enable depth testing and back-face culling
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // shaders -- sync
    /*
    // define shaders + program(cube)
    var vert1 = utils.createShader(gl, gl.VERTEX_SHADER, vs);
    var frag1 = utils.createShader(gl, gl.FRAGMENT_SHADER, fs);
    programs[0] = utils.createProgram(gl, vert1, frag1);
    // installs the program object specified, as part of current rendering state
    gl.useProgram(programs[0]);
*/

    // Lambert diffuse
    positionAttributeLocation[0] = gl.getAttribLocation(programs[0], "inPosition");
    normalAttributeLocation[0] = gl.getAttribLocation(programs[0], "inNormal");
    matrixLocation[0] = gl.getUniformLocation(programs[0], "matrix");
    materialDiffColorHandle[0] = gl.getUniformLocation(programs[0], 'mDiffColor');
    lightDirectionHandle[0] = gl.getUniformLocation(programs[0], 'lightDirection');
    lightColorHandle[0] = gl.getUniformLocation(programs[0], 'lightColor');
    normalMatrixPositionHandle[0] = gl.getUniformLocation(programs[0], 'nMatrix');

    var vaos = new Array();
    // initialize vertex array object and bind (VAO)
    vaos[0] = gl.createVertexArray();
    gl.bindVertexArray(vaos[0]);

    // ***** Create and bind buffers for position, normals, index:
    // Create and bind POSITION buffer -- vertices from model
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation[0]);
    gl.vertexAttribPointer(positionAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

    // Create and bind NORMAL buffer -- normals from model
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation[0]);
    gl.vertexAttribPointer(normalAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

    // Create and bind INDEX buffer -- indices from model
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    drawScene();

    // Draw the scene
    function drawScene() {
        // console.log("drawScene() run");
        gl.clearColor(0.85, 0.85, 0.85, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // console.log(dirLight);

        // view matrix with parameters
        viewMatrix = utils.MakeViewR(cx, cy, cz, elev, ang, roll);

        // ***** Move/rotate Camera with Keys (WASD + ARROWS)
        // Prepare rotation transform matrix - quaternion
        DVecMat = utils.transposeMatrix(viewMatrix);
        DVecMat[12] = DVecMat[13] = DVecMat[14] = 0.0;
        
        // define axes of rotation
        xaxis = [DVecMat[0], DVecMat[4], DVecMat[8]];
        yaxis = [DVecMat[1], DVecMat[5], DVecMat[9]];
        zaxis = [DVecMat[2], DVecMat[6], DVecMat[10]];

        if ((rvx != 0) || (rvy != 0) || (rvz != 0)) {
            // theta
            qx = Quaternion.fromAxisAngle(xaxis, utils.degToRad(rvx * 1));
            // phi
            qy = Quaternion.fromAxisAngle(yaxis, utils.degToRad(rvy * 1));
            // psi
            qz = Quaternion.fromAxisAngle(zaxis, utils.degToRad(rvz * 1));
            
            newDVecMat = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(
                qy.toMatrix4(), qx.toMatrix4()), qz.toMatrix4()), DVecMat);
            
            // Rotation transform matrix for quaternion
            R11 = newDVecMat[10];
            console.log("R11: " + R11);
            R12 = newDVecMat[8];
            R13 = newDVecMat[9];
            R21 = newDVecMat[2];
            R22 = newDVecMat[0];
            R23 = newDVecMat[1];
            R31 = newDVecMat[6];
            console.log("R31: " + R31);
            R32 = newDVecMat[4];
            R33 = newDVecMat[5];

            if ((R31 < 1) && (R31 > -1)) {
                theta = -Math.asin(R31);
                phi = Math.atan2(R32 / Math.cos(theta), R33 / Math.cos(theta));
                psi = Math.atan2(R21 / Math.cos(theta), R11 / Math.cos(theta));

            } else {
                phi = 0;
                if (R31 <= -1) {
                    theta = Math.PI / 2;
                    psi = phi + Math.atan2(R12, R13);
                } else {
                    theta = -Math.PI / 2;
                    psi = Math.atan2(-R12, -R13) - phi;
                }
            }
            elev = theta / Math.PI * 180;
            roll = phi / Math.PI * 180;
            ang = psi / Math.PI * 180;
        } 

        // update the camera-position "WASD"
        delta = utils.multiplyMatrixVector(DVecMat, [vx, vy, vz, 0.0]);
        cx += delta[0] / 10;
        cy += delta[1] / 10;
        cz += delta[2] / 10;


        // ***** World,View,Projection Matrices
        var worldViewMatrix = utils.multiplyMatrices(viewMatrix, cubeWorld);
        var wvpMatrix = utils.multiplyMatrices(perspProjectionMatrix, worldViewMatrix);

        // lights
        var lightDirMatrix = utils.invertMatrix(utils.transposeMatrix(viewMatrix));

        var lightDirectionTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(lightDirMatrix), dirLight);

        // rendering -- (location, transpose, value)
        gl.uniformMatrix4fv(matrixLocation[0], gl.FALSE, utils.transposeMatrix(wvpMatrix));

        var cubeNormalMatrix = utils.invertMatrix(utils.transposeMatrix(worldViewMatrix));

        // rendering -- (location, transpose, value)
        gl.uniformMatrix4fv(normalMatrixPositionHandle[0], gl.FALSE, utils.transposeMatrix(cubeNormalMatrix));

        // rendering colors, material, etc. -- (location, transpose, value)
        gl.uniform3fv(materialDiffColorHandle[0], cubeMaterialColor);
        gl.uniform3fv(lightColorHandle[0], dirLightColor);
        gl.uniform3fv(lightDirectionHandle[0], lightDirectionTransformed);

        gl.bindVertexArray(vaos[0]);
        gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0.0);

        window.requestAnimationFrame(drawScene);
        // console.log("scene drawn");
    }


}
/*
window.onload = main;
*/

async function init() {
    console.log("init() run");
    // ***** variables to enable loading of shaders/.glsl
    var path = window.location.pathname;
    var page = path.split("/").pop();
    baseDir = window.location.href.replace(page, '');
    shaderDir = baseDir + "shaders/";
    assetsDir = baseDir + "assets/";

    // ***** CANVAS preperation
    var canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }
    utils.resizeCanvasToDisplaySize(gl.canvas);
    // console.log("canvas ok");

    // ***** Define SHADERS AND PROGRAMS *****

    // prepare shaders and program
    await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        gl.compileShader(vertexShader);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
        gl.compileShader(fragmentShader);
        programs[0] = utils.createProgram(gl, vertexShader, fragmentShader);
        // console.log("programs updated");
    });
    gl.linkProgram(programs[0]);
    gl.useProgram(programs[0]);
    // run main
    main();
}

window.onload = init();
