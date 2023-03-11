var gl;
var mycanvas;
var program;
var vertexBuffer;
function awake() {
    mycanvas = document.getElementById('myCanvas');
    gl = createGlContext(mycanvas);
    setupShaders();
    setupBuffers();
    draw();
}

function createGlContext(canvas) {
    var names = ["webgl", "experimental-webgl"];
    let context = null;
    for (let i = 0; i < names.length; i++) {
        try {
            context = canvas.getContext(names[i]);
        } catch (e) {
            console.log(e);
        }
        if (context)
            break;
    }
    if (context) {
        context.width = canvas.width;
        context.height = canvas.height;
        return context;
    } else {
        alert("WebGL not supported");
    }
    return context;
}

function loadShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function setupShaders() {
    const vertexShaderSource = `attribute vec3 a_position; void main() { gl_Position = vec4(a_position, 1); }`;
    const fragmentShaderSource = `precision mediump float; void main() { gl_FragColor = vec4(1, 1, 1, 1); }`;
    const vertexShader = loadShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success)
        alert('fail to set up shaders!');

    gl.useProgram(program);
    program.vertexPositionAttribute = gl.getAttribLocation(program, 'a_position');
    return program;
}

function setupBuffers() {
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    const triangleVertices = [
        0, 0.5, 0,
        -0.5, -0.5, 0,
        0.5, -0.5, 0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
    vertexBuffer.itemSize = 3;
    vertexBuffer.numberOfItems = 3;
}

function draw() {
    gl.viewport(0, 0, gl.width, gl.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.vertexAttribPointer(program.vertexPositionAttribute, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vertexPositionAttribute);
    gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.numberOfItems);
}