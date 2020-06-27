// GLOBAL VAR
var gl;
var baseDir;
var shaderDir;
var assetsDir;
var program;
var modelStr = 'skeleton.obj';
var textureStr = 'skeleton.png';

// camera parameters - init position
var viewMatrix;
var cx = 0.0,
    cy = 0.0,
    cz = 0.0,
    elev = 0.0,
    ang = 0.0,
    roll = 0.0;
//camRadius = 10.0;

// Object parameters - init
var objectWorld = null,
    skelMesh = null;
// Skeleton {0, -2.5, -4, 0, 10, 0, 0.07}
var Tx = 0.60, 
    Ty = -2.80,
    Tz = -4.0,
    Rx = -8.0,
    Ry = 10.0,
    Rz = 0.0,
    Scale = 0.07;

// mouse & keys -- OBJECT movement parameters
var keys = [],
    vx = 0.0,
    vy = 0.0,
    vz = 0.0,
    rvx = 0.0,
    rvy = 0.0,
    rvz = 0.0,
    mouseState = false,
    lastMouseX = -100,
    lastMouseY = -100;



// listeners
window.addEventListener("keyup", utils.keyFunctionUp, false);
window.addEventListener("keydown", utils.keyFunctionDown, false);
document.querySelectorAll(".btn").forEach(item => {
    item.addEventListener("click", utils.buttonClick, false);
});
// --------------- Assets guide
// https://webgl2fundamentals.org/webgl/lessons/webgl-load-obj.html

console.log("app.js started");

// Visualizer Main
function main() {
    utils.resizeCanvasToDisplaySize(gl.canvas);
    // set viewport (Lower-left corner of the viewport, width, height)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // clearing BUFFERS
    gl.clearColor(0.85, 0.85, 0.85, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // enable depth testing and back-face culling
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);


    // Model - Position (vertices), normals, indices, UVcoords
    var skelVertices = skelMesh.vertices;
    var skelNormals = skelMesh.vertexNormals;
    var skelIndices = skelMesh.indices;
    var skelTexCoords = skelMesh.textures;




    // ***** MATRICES, LIGHTS, COLOR *****

    // Perspective
    var aspect = gl.canvas.width / gl.canvas.height;
    var perspProjMatrix = utils.MakePerspective(90.0, aspect, 0.01, 1000.0);

    // Skeleton material color
    var objMaterialColor = [1.0, 1.0, 1.0];

    // Defining directional light
    // 0 --> viewing direction
    var dirLightA = -utils.degToRad(0);
    var dirLightB = -utils.degToRad(90);
    var dirLight = [Math.cos(dirLightA) * Math.cos(dirLightB), Math.sin(dirLightA), Math.cos(dirLightA) * Math.sin(dirLightB)];
    var dirLightColor = [10.0, 10.0, 10.0];

    var LPos = [3.0, -10.0, 3.0];
    var LlightColor = [1.0, 1.0, 1.0];


    // ***** SHADERS & BUFFERS *****
    // Init attributes
    var positionAttributeLocation = new Array(),
        normalAttributeLocation = new Array();

    var matrixLocation = new Array(),
        materialDiffColorHandle = new Array();

    var lightDirectionHandle = new Array(),
        lightDirMatrixPositionHandle = new Array(),
        lightColorHandle = new Array();

    var lightPosHandle = new Array(),
        lightColorHandle = new Array();

    var normalMatrixLocation = new Array();
    var materialDiffColorHandle = new Array();
    var textureCoordinateLocation = new Array();
    var textureUniform = new Array();


    // Attributes located in the shaders ==> attach to program
    // lookup where the vertex data needs to go
    positionAttributeLocation[0] = gl.getAttribLocation(program, "inPosition");
    normalAttributeLocation[0] = gl.getAttribLocation(program, "inNormal");
    textureCoordinateLocation[0] = gl.getAttribLocation(program, "inUV");

    // lookup uniforms
    matrixLocation[0] = gl.getUniformLocation(program, "pMatrix");
    normalMatrixLocation[0] = gl.getUniformLocation(program, 'nMatrix');

    textureUniform[0] = gl.getUniformLocation(program, "uTexture");

    materialDiffColorHandle[0] = gl.getUniformLocation(program, 'mDiffColor');

    // Position Light (light bulb)
    lightPosHandle[0] = gl.getUniformLocation(program, 'lightPosition');
    lightColorHandle[0] = gl.getUniformLocation(program, 'posLightColor');

    // Directional Light (sunshine)
    lightDirectionHandle[0] = gl.getUniformLocation(program, 'lightDirection');
    lightColorHandle[0] = gl.getUniformLocation(program, 'dirLightColor');
    lightDirMatrixPositionHandle[0] = gl.getUniformLocation(program, 'lightDirMatrix');




    // initialize vertex array object and bind (VAO)
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Initialize and bind buffers for position, normals, index:
    // POSITION buffer -- vertices from model
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(skelVertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation[0]);
    gl.vertexAttribPointer(positionAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

    // TEXTURE buffer -- texCoords from model
    var uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(skelTexCoords), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(textureCoordinateLocation[0]);
    gl.vertexAttribPointer(textureCoordinateLocation[0], 2, gl.FLOAT, false, 0, 0);

    // NORMAL buffer -- normals from model
    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(skelNormals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttributeLocation[0]);
    gl.vertexAttribPointer(normalAttributeLocation[0], 3, gl.FLOAT, false, 0, 0);

    // INDEX buffer -- indices from model
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(skelIndices), gl.STATIC_DRAW);

    // CREATE TEXTURE 
    var skelTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, skelTexture);

    var imgtx = new Image();
    imgtx.src = assetsDir + textureStr;
    imgtx.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, skelTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgtx);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
    };

    drawScene();

    // Draw the scene
    function drawScene() {
        // console.log("drawScene() run");
        utils.resizeCanvasToDisplaySize(gl.canvas);
        gl.clearColor(0.85, 0.85, 0.85, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // view matrix with parameters (cx, cy, cz, elev, ang, roll) {aligned to the Z-axis}
        viewMatrix = utils.MakeViewR(0.0, 0.0, 0.0, 0.0, 0.0, 0.0);

        // Model world space - update for movement
        objectWorld = utils.MakeWorld(Tx, Ty, Tz, Rx, Ry, Rz, Scale);
        // ***** MOVE/ROTATE/ZOOM with Keys & Mouse (WASD)

        // quaternion ----- NOT USED
        /*
        // Prepare rotation transform matrix - quaternion
       
        DVecMat = utils.transposeMatrix(cubeWorld);
        DVecMat[12] = DVecMat[13] = DVecMat[14] = 0.0;

        // define axes of rotation
        xaxis = [DVecMat[0], DVecMat[4], DVecMat[8]];
        yaxis = [DVecMat[1], DVecMat[5], DVecMat[9]];
        zaxis = [DVecMat[2], DVecMat[6], DVecMat[10]];

        if ((rvx != 0) || (rvy != 0) || (rvz != 0)) {
            // theta
            qx = Quaternion.fromAxisAngle(xaxis, utils.degToRad(rvx * 1));
            // psi
            qy = Quaternion.fromAxisAngle(yaxis, utils.degToRad(rvy * 1));
            // phi
            qz = Quaternion.fromAxisAngle(zaxis, utils.degToRad(rvz * 1));

            newDVecMat = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(
                qy.toMatrix4(), qx.toMatrix4()), qz.toMatrix4()), DVecMat);

            // Rotation transform matrix for quaternion
            R11 = newDVecMat[10];
            R12 = newDVecMat[8];
            R13 = newDVecMat[9];
            R21 = newDVecMat[2];
            R22 = newDVecMat[0];
            R23 = newDVecMat[1];
            R31 = newDVecMat[6];
            R32 = newDVecMat[4];
            R33 = newDVecMat[5];

            // gimbal order
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
            cubeRx = theta / Math.PI * 180;
            cubeRz = phi / Math.PI * 180;
            cubeRy = psi / Math.PI * 180;
        }
*/

        // KEYBOARD:
        // update the position according to vx,vy,vz ==> "WASD"
        console.log("cx: " + cx + "-- cy: " + cy + "-- cz: " + cz);
        console.log("vx: " + vx + "-- vy: " + vy + "-- vz: " + vz);
        delta = [vx, vy, vz, 0.0];
        Tx -= delta[0] / 10;
        Ty += delta[1] / 10;
        Tz -= delta[2] / 10;

        console.log("X: " + Tx + "-- Y: " + Ty + "-- Z: " + Tz);




        // ***** World-View-Projection Matrices *****
        var worldViewMatrix = utils.multiplyMatrices(viewMatrix, objectWorld);
        var wvpMatrix = utils.multiplyMatrices(perspProjMatrix, worldViewMatrix);

        
        // Ligth calculations
        var lightDirMatrix = utils.invertMatrix(utils.transposeMatrix(viewMatrix));

        var lightDirectionTransformed = utils.multiplyMatrix3Vector3(utils.sub3x3from4x4(lightDirMatrix), dirLight);

        // normal matrix
        var normalMatrix = utils.invertMatrix(utils.transposeMatrix(worldViewMatrix));




        // ***** Assign values to shader attributes *****
        //gl.uniform1i(textureUniform[0], 0);
        /*
        gl.uniformMatrix4fv(matrixLocation[0], gl.FALSE, utils.transposeMatrix(wvpMatrix));

        gl.uniformMatrix4fv(normalMatrixPositionHandle[0], gl.FALSE, utils.transposeMatrix(normalMatrix));

        // rendering colors, material, etc. -- (location, transpose, value)
        gl.uniformMatrix4fv(lightDirMatrixPositionHandle[0], gl.FALSE, utils.transposeMatrix(lightDirMatrix));
        gl.uniform3fv(materialDiffColorHandle[0], objMaterialColor);
        gl.uniform3fv(lightColorHandle[0], dirLightColor);
        gl.uniform3fv(lightDirectionHandle[0], dirLight);
*/
        // Texture
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(textureUniform[0], skelTexture);
        
        // WVP
        gl.uniformMatrix4fv(matrixLocation[0], gl.FALSE, utils.transposeMatrix(wvpMatrix));
        // Normal
        gl.uniformMatrix4fv(normalMatrixLocation[0], gl.FALSE, utils.transposeMatrix(normalMatrix));
        
        // Point Light
        gl.uniform3fv(lightPosHandle[0], LPos);
        gl.uniform3fv(lightColorHandle[0], LlightColor);

        // lambert diffuse
        gl.uniform3fv(materialDiffColorHandle[0], objMaterialColor);
        gl.uniform3fv(lightColorHandle[0], dirLightColor);
        gl.uniform3fv(lightDirectionHandle[0], dirLight);
        
        
        gl.bindVertexArray(vao);
        gl.drawElements(gl.TRIANGLES, skelIndices.length, gl.UNSIGNED_SHORT, 0);

        window.requestAnimationFrame(drawScene);
        // console.log("scene drawn");
    }

}

async function init() {
    console.log("init() run");
    // ***** variables to enable loading of shaders/.glsl
    var path = window.location.pathname;
    var page = path.split("/").pop();
    baseDir = window.location.href.replace(page, '');
    shaderDir = baseDir + "shaders/";
    assetsDir = baseDir + "assets/";




    // ***** CANVAS preperation *****
    var canvas = document.getElementById("canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
        document.write("GL context not opened");
        return;
    }
    utils.resizeCanvasToDisplaySize(gl.canvas);

    // event listeners for mouse
    canvas.addEventListener("mousewheel", utils.doMouseWheel, false);
    canvas.addEventListener("mousedown", utils.doMouseDown, false);
    canvas.addEventListener("mouseup", utils.doMouseUp, false);
    canvas.addEventListener("mousemove", utils.doMouseMove, false);




    // ***** Define SHADERS AND PROGRAMS *****
    // prepare shaders and program
    await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        gl.compileShader(vertexShader);
        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            alert("ERROR IN VS SHADER : " + gl.getShaderInfoLog(vertexShader));
        }
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
        gl.compileShader(fragmentShader);
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            alert("ERROR IN FS SHADER : " + gl.getShaderInfoLog(fragmentShader));
        }

        program = utils.createProgram(gl, vertexShader, fragmentShader);
    });
    gl.linkProgram(program);
    gl.useProgram(program);

    // loading the .obj model
    var skeletObjStr = await utils.get_objstr(assetsDir + modelStr);
    skelMesh = new OBJ.Mesh(skeletObjStr);

    // run main
    main();
}

window.onload = init();
