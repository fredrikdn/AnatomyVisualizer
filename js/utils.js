var utils = {



    //**** CANVAS OPERATIONS
    // Function to resize canvas depending on display
    resizeCanvasToDisplaySize: function (canvas) {
        const expandFullScreen = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            console.log(canvas.width + " " + window.innerWidth);

        };
        expandFullScreen();
        // Resize screen when the browser has triggered the resize event
        window.addEventListener('resize', expandFullScreen);
    },






    //**** MODEL UTILS
    // Function to load a 3D model in JSON format
    get_json: function (url, func) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, false); // if true == asynchronous...
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                //the file is loaded. Parse it as JSON and launch function
                func(JSON.parse(xmlHttp.responseText));
            }
        };
        //send the request
        xmlHttp.send();
    },

    get_objstr: async function (url) {
        var response = await fetch(url);
        if (!response.ok) {
            alert('Network response was not ok');
            return;
        }
        var text = await response.text();
        return text;
    },

    //function to convert decimal value of colors 
    decimalToHex: function (d, padding) {
        var hex = Number(d).toString(16);
        padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

        while (hex.length < padding) {
            hex = "0" + hex;
        }

        return hex;
    },






    // *** SHADERS UTILS
    createAndCompileShaders: function (gl, shaderText) {

        var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
        var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);

        var program = utils.createProgram(gl, vertexShader, fragmentShader);

        return program;
    },

    // Function that creates the shader
    createShader: function (gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        } else {
            console.log(gl.getShaderInfoLog(shader)); // eslint-disable-line
            if (type == gl.VERTEX_SHADER) {
                alert("ERROR IN VERTEX SHADER : " + gl.getShaderInfoLog(vertexShader));
            }
            if (type == gl.FRAGMENT_SHADER) {
                alert("ERROR IN FRAGMENT SHADER : " + gl.getShaderInfoLog(fragmentShader));
            }
            gl.deleteShader(shader);
            throw "could not compile shader:" + gl.getShaderInfoLog(shader);
        }


    },

    // Function that creates the program and attaches the shaders to be used
    createProgram: function (gl, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        var success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        } else {
            throw ("program filed to link:" + gl.getProgramInfoLog(program));
            console.log(gl.getProgramInfoLog(program)); // eslint-disable-line
            gl.deleteProgram(program);
            return undefined;
        }
    },


    /* Function to load a shader's code, compile it and return the handle to it
    Requires:
    	path to the shader's text (url)
    */

    loadFile: async function (url, data, callback, errorCallBack) {
        var response = await fetch(url);
        if (!response.ok) {
            alert('Network response was not ok');
            return;
        }
        var text = await response.text();
        callback(text, data);
    },

    loadFiles: async function (urls, callback, errorCallback) {
        console.log("start load files");
        var numUrls = urls.length;
        var numComplete = 0;
        var result = [];

        // Callback for a single file
        function partialCallback(text, urlIndex) {
            result[urlIndex] = text;
            numComplete++;
            console.log("num complete: " + numComplete);

            // When all files have downloaded
            if (numComplete == numUrls) {
                console.log("all files downloaded")
                callback(result);
            }
        }

        for (var i = 0; i < numUrls; i++) {
            await this.loadFile(urls[i], i, partialCallback, errorCallback);
        }
    },


    /* //must use ASYNC because of many shaders used
    loadFile: function (url, data, callback, errorCallback) {
        // Set up a synchronous request! 
        var request = new XMLHttpRequest();
        request.open('GET', url, false);

        // Hook the event that gets called as the request progresses
        request.onreadystatechange = function () {
            // If the request is "DONE" (completed or failed) and if we got HTTP status 200 (OK)


            if (request.readyState == 4 && request.status == 200) {
                callback(request.responseText, data)
                //} else { // Failed
                //	errorCallback(url);
            }

        };

        request.send(null);
    },

    loadFiles: function (urls, callback, errorCallback) {
        var numUrls = urls.length;
        var numComplete = 0;
        var result = [];

        // Callback for a single file
        function partialCallback(text, urlIndex) {
            result[urlIndex] = text;
            numComplete++;

            // When all files have downloaded
            if (numComplete == numUrls) {
                callback(result);
            }
        }

        for (var i = 0; i < numUrls; i++) {
            this.loadFile(urls[i], i, partialCallback, errorCallback);
        }
    },

    */







    // *** MATH LIBRARY

    degToRad: function (angle) {
        return (angle * Math.PI / 180);
    },

    identityMatrix: function () {
        return [1, 0, 0, 0,
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1];
    },

    // returns the 3x3 submatrix from a Matrix4x4
    sub3x3from4x4: function (m) {
        out = [];
        out[0] = m[0];
        out[1] = m[1];
        out[2] = m[2];
        out[3] = m[4];
        out[4] = m[5];
        out[5] = m[6];
        out[6] = m[8];
        out[7] = m[9];
        out[8] = m[10];
        return out;
    },

    // Multiply the mat3 with a vec3.
    multiplyMatrix3Vector3: function (m, a) {

        out = [];
        var x = a[0],
            y = a[1],
            z = a[2];
        out[0] = x * m[0] + y * m[1] + z * m[2];
        out[1] = x * m[3] + y * m[4] + z * m[5];
        out[2] = x * m[6] + y * m[7] + z * m[8];
        return out;
    },


    //requires as a parameter a 4x4 matrix (array of 16 values)
    invertMatrix: function (m) {

        var out = [];
        var inv = [];
        var det, i;

        inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] +
            m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];

        inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] + m[8] * m[6] * m[15] -
            m[8] * m[7] * m[14] - m[12] * m[6] * m[11] + m[12] * m[7] * m[10];

        inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] +
            m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];

        inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] + m[8] * m[5] * m[14] -
            m[8] * m[6] * m[13] - m[12] * m[5] * m[10] + m[12] * m[6] * m[9];

        inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] + m[9] * m[2] * m[15] -
            m[9] * m[3] * m[14] - m[13] * m[2] * m[11] + m[13] * m[3] * m[10];

        inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] +
            m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];

        inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] -
            m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];

        inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] +
            m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];

        inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15] +
            m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];

        inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15] -
            m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];

        inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15] +
            m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];

        inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14] -
            m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];

        inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] -
            m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];

        inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] +
            m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];

        inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] -
            m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];

        inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] +
            m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];

        det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

        if (det == 0)
            return out = this.identityMatrix();

        det = 1.0 / det;

        for (i = 0; i < 16; i++) {
            out[i] = inv[i] * det;
        }

        return out;
    },

    transposeMatrix: function (m) {
        var out = [];

        var row, column, row_offset;

        row_offset = 0;
        for (row = 0; row < 4; ++row) {
            row_offset = row * 4;
            for (column = 0; column < 4; ++column) {
                out[row_offset + column] = m[row + column * 4];
            }
        }
        return out;
    },

    multiplyMatrices: function (m1, m2) {
        // Perform matrix product  { out = m1 * m2;}
        var out = [];

        var row, column, row_offset;

        row_offset = 0;
        for (row = 0; row < 4; ++row) {
            row_offset = row * 4;
            for (column = 0; column < 4; ++column) {
                out[row_offset + column] =
                    (m1[row_offset + 0] * m2[column + 0]) +
                    (m1[row_offset + 1] * m2[column + 4]) +
                    (m1[row_offset + 2] * m2[column + 8]) +
                    (m1[row_offset + 3] * m2[column + 12]);
            }
        }
        return out;
    },

    multiplyMatrixVector: function (m, v) {
        /* Mutiplies a matrix [m] by a vector [v] */

        var out = [];

        var row, row_offset;

        row_offset = 0;
        for (row = 0; row < 4; ++row) {
            row_offset = row * 4;

            out[row] =
                (m[row_offset + 0] * v[0]) +
                (m[row_offset + 1] * v[1]) +
                (m[row_offset + 2] * v[2]) +
                (m[row_offset + 3] * v[3]);

        }
        return out;
    },
    crossVector: function (u, v) {
        /* cross product of vectors [u] and  [v] */

        var out = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];

        return out;
    },
    normalizeVector3: function (v) {
        /* cross product of vectors [u] and  [v] */
        var len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        var out = [v[0] / len, v[1] / len, v[2] / len];

        return out;
    },








    //*** MODEL MATRIX OPERATIONS


    MakeTranslateMatrix: function (dx, dy, dz) {
        // Create a transform matrix for a translation of ({dx}, {dy}, {dz}).

        var out = this.identityMatrix();

        out[3] = dx;
        out[7] = dy;
        out[11] = dz;
        return out;
    },

    MakeRotateXMatrix: function (a) {
        // Create a transform matrix for a rotation of {a} along the X axis.

        var out = this.identityMatrix();

        var adeg = this.degToRad(a);
        var c = Math.cos(adeg);
        var s = Math.sin(adeg);

        out[5] = out[10] = c;
        out[6] = -s;
        out[9] = s;

        return out;
    },

    MakeRotateYMatrix: function (a) {
        // Create a transform matrix for a rotation of {a} along the Y axis.

        var out = this.identityMatrix();

        var adeg = this.degToRad(a);

        var c = Math.cos(adeg);
        var s = Math.sin(adeg);

        out[0] = out[10] = c;
        out[2] = s;
        out[8] = -s;

        return out;
    },

    MakeRotateZMatrix: function (a) {
        // Create a transform matrix for a rotation of {a} along the Z axis.

        var out = this.identityMatrix();

        var adeg = this.degToRad(a);
        var c = Math.cos(adeg);
        var s = Math.sin(adeg);

        out[0] = out[5] = c;
        out[4] = s;
        out[1] = -s;

        return out;
    },

    MakeScaleMatrix: function (s) {
        // Create a transform matrix for proportional scale

        var out = this.identityMatrix();

        out[0] = out[5] = out[10] = s;

        return out;
    },

    MakeScaleNuMatrix: function (sx, sy, sz) {
        // Create a scale matrix for a scale of ({sx}, {sy}, {sz}).

        var out = this.identityMatrix();
        out[0] = sx;
        out[5] = sy;
        out[10] = sz;
        return out;
    },

    MakeShearXMatrix: function (hy, hz) {
        // Create a scale matrix for a scale of ({sx}, {sy}, {sz}).

        var out = this.identityMatrix();
        out[4] = hy;
        out[8] = hz;
        return out;
    },

    MakeShearYMatrix: function (hx, hz) {
        // Create a scale matrix for a scale of ({sx}, {sy}, {sz}).

        var out = this.identityMatrix();
        out[1] = hx;
        out[9] = hz;
        return out;
    },

    MakeShearZMatrix: function (hx, hy) {
        // Create a scale matrix for a scale of ({sx}, {sy}, {sz}).

        var out = this.identityMatrix();
        out[2] = hx;
        out[6] = hy;
        return out;
    },


    // *** Projection Matrix operations
    MakeWorld: function (tx, ty, tz, rx, ry, rz, s) {
        //Creates a world matrix for an object.

        var Rx = this.MakeRotateXMatrix(ry);
        var Ry = this.MakeRotateYMatrix(rx);
        var Rz = this.MakeRotateZMatrix(rz);
        var S = this.MakeScaleMatrix(s);
        var T = this.MakeTranslateMatrix(tx, ty, tz);

        out = this.multiplyMatrices(Rz, S);
        out = this.multiplyMatrices(Ry, out);
        out = this.multiplyMatrices(Rx, out);
        out = this.multiplyMatrices(T, out);

        return out;
    },

    MakeView: function (cx, cy, cz, elev, ang) {
        // Creates in {out} a view matrix. The camera is centerd in ({cx}, {cy}, {cz}).
        // It looks {ang} degrees on y axis, and {elev} degrees on the x axis.

        var T = [];
        var Rx = [];
        var Ry = [];
        var tmp = [];
        var out = [];

        T = this.MakeTranslateMatrix(-cx, -cy, -cz);
        Rx = this.MakeRotateXMatrix(-elev);
        Ry = this.MakeRotateYMatrix(-ang);

        tmp = this.multiplyMatrices(Ry, T);
        out = this.multiplyMatrices(Rx, tmp);

        return out;
    },

    // UPDATED to include Roll
    MakeViewR: function (cx, cy, cz, elev, ang, roll) {
        // Creates in {out} a view matrix. The camera is centerd in ({cx}, {cy}, {cz}).
        // It looks {ang} degrees on y axis, and {elev} degrees on the x axis.

        var T = [];
        var Rx = [];
        var Ry = [];
        var Rz = [];
        var out = [];

        T = this.MakeTranslateMatrix(-cx, -cy, -cz);
        Rx = this.MakeRotateXMatrix(-elev);
        Ry = this.MakeRotateYMatrix(-ang);
        Rz = this.MakeRotateZMatrix(-roll);

        out = this.multiplyMatrices(Ry, T);
        out = this.multiplyMatrices(Rx, out);
        out = this.multiplyMatrices(Rz, out);

        return out;
    },

    MakePerspective: function (fovy, a, n, f) {
        // Creates the perspective projection matrix. The matrix is returned.
        // {fovy} contains the vertical field-of-view in degrees. {a} is the aspect ratio.
        // {n} is the distance of the near plane, and {f} is the far plane.

        var perspective = this.identityMatrix();

        var halfFovyRad = this.degToRad(fovy / 2); // stores {fovy/2} in radiants
        var ct = 1.0 / Math.tan(halfFovyRad); // cotangent of {fov/2}

        perspective[0] = ct / a;
        perspective[5] = ct;
        perspective[10] = (f + n) / (n - f);
        perspective[11] = 2.0 * f * n / (n - f);
        perspective[14] = -1.0;
        perspective[15] = 0.0;

        return perspective;
    },

    MakeParallel: function (w, a, n, f) {
        // Creates the parallel projection matrix. The matrix is returned.
        // {w} contains the horizontal half-width in world units. {a} is the aspect ratio.
        // {n} is the distance of the near plane, and {f} is the far plane.

        var parallel = this.identityMatrix();

        parallel[0] = 1.0 / w;
        parallel[5] = a / w;
        parallel[10] = 2.0 / (n - f);
        parallel[11] = (n + f) / (n - f);

        return parallel;
    },

    MakeLookAt: function (c, a, u) {
        // Creates in {out} a view matrix, using the look-at from vector c to vector a.

        Vz = this.normalizeVector3([c[0] - a[0], c[1] - a[1], c[2] - a[2]]);
        Vx = this.normalizeVector3(this.crossVector(this.normalizeVector3(u), Vz));
        Vy = this.crossVector(Vz, Vx);

        CM = [Vx[0], Vy[0], Vz[0], c[0],
			   Vx[1], Vy[1], Vz[1], c[1],
			   Vx[2], Vy[2], Vz[2], c[2],
			    0.0, 0.0, 0.0, 1.0]

        // calling the invert procedure
        //		out = this.invertMatrix(CM);

        // manual inversion
        out = [Vx[0], Vx[1], Vx[2], 0.0,
			   Vy[0], Vy[1], Vy[2], 0.0,
			   Vz[0], Vz[1], Vz[2], 0.0,
			    0.0, 0.0, 0.0, 1.0];
        nc = this.multiplyMatrixVector(out, [c[0], c[1], c[2], 0.0]);
        out[3] = -nc[0];
        out[7] = -nc[1];
        out[11] = -nc[2];

        return out;
    },




    // *** KEY & MOUSE FUNCTIONS

    doMouseDown: function (e) {
        lastMouseX = event.pageX;
        lastMouseY = event.pageY;
        mouseState = true;
    },

    doMouseUp: function (e) {
        lastMouseX = -100;
        lastMouseY = -100;
        mouseState = false;
    },

    doMouseMove: function (e) {
        if (mouseState) {
            var dx = event.pageX - lastMouseX;
            var dy = lastMouseY - event.pageY;
            lastMouseX = event.pageX;
            lastMouseY = event.pageY;

            if ((dx != 0) || (dy != 0)) {
                Rx = Rx + 0.5 * dx;
                Ry = Ry - 0.5 * dy;
            }
        }
    },

    doMouseWheel: function (e) {
        var translateUpDown = Ty + e.wheelDelta / 500.0;
        if ((translateUpDown > -5.0) && (translateUpDown < 0.0)) {
            Ty = translateUpDown;
        }
    },

    keyFunctionDown: function (e) {
        if (!keys[e.keyCode]) {
            keys[e.keyCode] = true;
            switch (e.keyCode) {
                case 37:
                    //console.log("KeyUp   - Dir LEFT");
                    rvy = rvy + 1.0;
                    break;
                case 39:
                    //console.log("KeyUp   - Dir RIGHT");
                    rvy = rvy - 1.0;
                    break;
                case 38:
                    //console.log("KeyUp   - Dir UP");
                    rvx = rvx + 1.0;
                    break;
                case 40:
                    //console.log("KeyUp   - Dir DOWN");
                    rvx = rvx - 1.0;
                    break;
                case 81:
                    //console.log("KeyUp   - Dir ROLL LEFT");
                    rvz = rvz + 1.0;
                    break;
                case 69:
                    //console.log("KeyUp   - Dir ROLL RIGHT");
                    rvz = rvz - 1.0;
                    break;
                case 65:
                    //console.log("KeyUp   - Pos LEFT");
                    vx = vx - 1.0;
                    break;
                case 68:
                    //console.log("KeyUp   - Pos RIGHT");
                    vx = vx + 1.0;
                    break;
                case 82:
                    //console.log("KeyUp   - Pos UP");
                    vy = vy + 1.0;
                    break;
                case 70:
                    //console.log("KeyUp   - Pos DOWN");
                    vy = vy - 1.0;
                    break;
                case 87:
                    //console.log("KeyUp   - Pos FORWARD");
                    vz = vz - 1.0;
                    break;
                case 83:
                    //console.log("KeyUp   - Pos BACKWARD");
                    vz = vz + 1.0;
                    break;
            }
            console.log(vx + " " + vy + " " + vz + " " + rvx + " " + rvy + " " + rvz);
        }
        console.log(e.keyCode);
    },

    keyFunctionUp: function (e) {
        if (keys[e.keyCode]) {
            keys[e.keyCode] = false;
            switch (e.keyCode) {
                case 37:
                    console.log("KeyDown  - Dir LEFT");
                    rvy = rvy - 1.0;
                    break;
                case 39:
                    console.log("KeyDown - Dir RIGHT");
                    rvy = rvy + 1.0;
                    break;
                case 38:
                    console.log("KeyDown - Dir UP");
                    rvx = rvx - 1.0;
                    break;
                case 40:
                    console.log("KeyDown - Dir DOWN");
                    rvx = rvx + 1.0;
                    break;
                case 81:
                    console.log("KeyDown - Dir ROLL LEFT");
                    rvz = rvz - 1.0;
                    break;
                case 69:
                    console.log("KeyDown - Dir ROLL RIGHT");
                    rvz = rvz + 1.0;
                    break;
                case 65:
                    console.log("KeyDown - Pos LEFT");
                    vx = vx + 1.0;
                    break;
                case 68:
                    console.log("KeyDown - Pos RIGHT");
                    vx = vx - 1.0;
                    break;
                case 82:
                    console.log("KeyDown - Pos UP");
                    vy = vy - 1.0;
                    break;
                case 70:
                    console.log("KeyDown - Pos DOWN");
                    vy = vy + 1.0;
                    break;
                case 87:
                    console.log("KeyDown - Pos FORWARD");
                    vz = vz + 1.0;
                    break;
                case 83:
                    console.log("KeyDown - Pos BACKWARD");
                    vz = vz - 1.0;
                    break;
            }
            //	console.log(vx + " " + vy + " " + vz + " " + rvx + " " + rvy + " " + rvz);
        }
    },



    // *** ☜(ﾟヮﾟ☜)
    // *** BODYPART BUTTONS
    buttonClick: function (e) {
        if (e.target.id == "front") {
            Tx = 0.60,
                Ty = -2.80,
                Tz = -4.0,
                Rx = -8.0,
                Ry = 10.0,
                Rz = 0.0;
            document.getElementById("textBox").innerHTML = "The skeleton is the body part that provides support, shape and protection to the soft tissues and delicate organs of animals."
        }

        if (e.target.id == "head") {
            Tx = 0.30;
            Ty = -4.5;
            Tz = -1.6;
            Rx = 20.0;
            Ry = 10.0;
            Rz = 0.0;
            document.getElementById("textBox").innerHTML = "A head is the part of an organism which usually includes the ears, brain, forehead, cheeks, chin, eyes, nose, and mouth, each of which aid in various sensory functions such as sight, hearing, smell, and taste, respectively. "
        }

        if (e.target.id == "spine") {
            Tx = 0.30;
            Ty = -3.7;
            Tz = -2.0;
            Rx = 155.0;
            Ry = 10.0;
            Rz = 0.0;
            document.getElementById("textBox").innerHTML = "The vertebral column, also known as the backbone or spine, is part of the axial skeleton. The vertebral column is the defining characteristic of a vertebrate in which the notochord (a flexible rod of uniform composition) found in all chordates has been replaced by a segmented series of bone: vertebrae separated by intervertebral discs. The vertebral column houses the spinal canal, a cavity that encloses and protects the spinal cord."
        }

        if (e.target.id == "ribcage") {
            Tx = 0.30;
            Ty = -3.7;
            Tz = -1.75;
            Rx = -40.0;
            Ry = 10.0;
            Rz = 0.0;
            document.getElementById("textBox").innerHTML = "The rib cage is the arrangement of ribs attached to the vertebral column and sternum in the thorax of most vertebrates, that encloses and protects the heart and lungs. In humans, the rib cage, also known as the thoracic cage, is a bony and cartilaginous structure which surrounds the thoracic cavity and supports the shoulder girdle to form the core part of the human skeleton."
        }

        if (e.target.id == "arm") {
            Tx = 0.80;
            Ty = -2.75;
            Tz = -2.50;
            Rx = 55.0;
            Ry = 10.0;
            Rz = 0.0;
            document.getElementById("textBox").innerHTML = "Your arm is made up of three bones: the upper arm bone (humerus) and two forearm bones (the ulna and the radius)."
        }

        if (e.target.id == "pelvis") {
            Tx = 0.30;
            Ty = -2.50;
            Tz = -1.50;
            Rx = -20.0;
            Ry = 10.0;
            Rz = 0.0;
            document.getElementById("textBox").innerHTML = "Pelvis, also called bony pelvis or pelvic girdle, in human anatomy, basin-shaped complex of bones that connects the trunk and the legs, supports and balances the trunk, and contains and supports the intestines, the urinary bladder, and the internal sex organs."
        }

        if (e.target.id == "knee") {
            Tx = 0.60;
            Ty = -1.2;
            Tz = -1.5;
            Rx = 20.0;
            Ry = 10.0;
            Rz = 0.0;
            document.getElementById("textBox").innerHTML = "In humans and other primates, the knee joins the thigh with the leg and consists of two joints: one between the femur and tibia (tibiofemoral joint), and one between the femur and patella (patellofemoral joint). "
        }

        if (e.target.id == "foot") {
            Tx = 0.60;
            Ty = -0.1;
            Tz = -1.0;
            Rx = 20.0;
            Ry = 10.0;
            Rz = 0.0;
            document.getElementById("textBox").innerHTML = "The foot (plural feet) is an anatomical structure found in many vertebrates. It is the terminal portion of a limb which bears weight and allows locomotion. In many animals with feet, the foot is a separate organ at the terminal part of the leg made up of one or more segments or bones, generally including claws or nails."
        }

    },

}
