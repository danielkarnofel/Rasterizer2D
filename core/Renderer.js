import Matrix3 from '../math/Matrix3.js';

// A 2D WebGL2 renderer.

const vertexShaderSource = `#version 300 es

    uniform mat3 u_mp;
    
    in vec2 a_pos;
    in vec2 a_tex;

    out vec2 v_tex;

    void main() {
        v_tex = a_tex;
        vec3 pos = u_mp * vec3(a_pos, 1.0);
        gl_Position = vec4(pos.xy, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `#version 300 es

    precision highp float;

    uniform vec4 u_color;
    uniform sampler2D u_texture;
    uniform bool u_useTexture;

    in vec2 v_tex;

    out vec4 outColor;

    void main() {
        vec4 base = u_useTexture ? texture(u_texture, v_tex) : vec4(1.0);
        outColor = base * u_color;
    }
`;

const geometries = {
    rectangle: {
        positions: new Float32Array([-0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5]),
        uvs: new Float32Array([0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0]),
        drawMethod: 'TRIANGLES',
        vertexCount: 6,
    },
    triangle: {
        positions: new Float32Array([0.0, -0.5, -0.5, 0.5, 0.5, 0.5]),
        uvs: new Float32Array([0.5, 0.0, 0.0, 1.0, 1.0, 1.0]),
        drawMethod: 'TRIANGLES',
        vertexCount: 3,
    },
    ellipse: generateEllipse(),
};

function generateEllipse(segments = 64) {
    const positions = [0, 0];
    const uvs = [0.5, 0.5];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * 0.5;
        const y = Math.sin(angle) * 0.5;
        positions.push(x, y);
        uvs.push((x + 0.5), (y + 0.5));
    }
    const vertexCount = positions.length / 2;

    return {
        positions: new Float32Array(positions),
        uvs: new Float32Array(uvs),
        drawMethod: 'TRIANGLE_FAN',
        vertexCount: vertexCount
    };
}

export default class Renderer {

    constructor(canvas) {
        this.canvas = canvas;
        this.gl = getWebGL2Context(canvas);
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.projectionMatrix = new Matrix3().makeOrthographic(0, canvas.width, canvas.height, 0);
        this.vaoCache = {};
        this.texCache = new Map();
        this.defaultShader = new Shader(
            this.gl,
            vertexShaderSource,
            fragmentShaderSource,
            ["a_pos", "a_tex"],
            ["u_mp", "u_color", "u_texture", "u_useTexture"]
        );

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);
    }

    resize() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.projectionMatrix.makeOrthographic(0, this.canvas.width, this.canvas.height, 0);
    }

    clear(c = [0.15, 0.15, 0.15, 1.0]) {
        this.gl.clearColor(c[0], c[1], c[2], c[3]);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    updateAndRender(scene) {
        this.clear(scene.clearColor);
        scene.update();
        const drawList = scene.flatten();
        drawList.sort((a, b) => a.zIndex - b.zIndex);
        for (const node of drawList) {
            this.drawNode(node);
        }
    }

    getVAO(geometry) {
        if (this.vaoCache[geometry]) return this.vaoCache[geometry];
        const vao = this.createVAO(geometry);
        this.vaoCache[geometry] = vao;
        return vao;
    }

    createVAO(geometryType) {

        const gl = this.gl;
        const shader = this.defaultShader;
        const geometry = geometries[geometryType];

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shader.attributes.a_pos);
        gl.vertexAttribPointer(shader.attributes.a_pos, 2, gl.FLOAT, false, 0, 0);

        const textureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, geometry.uvs, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(shader.attributes.a_tex);
        gl.vertexAttribPointer(shader.attributes.a_tex, 2, gl.FLOAT, false, 0, 0);

        gl.bindVertexArray(null);

        return vao;
    }

    getTexture(source) {
        if (this.texCache.has(source)) return this.texCache.get(source);
        const texture = this.createTexture(source);
        this.texCache.set(source, texture);
        return texture;
    }

    createTexture(source) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    drawNode(node) {

        const gl = this.gl;
        const shader = this.defaultShader;

        if (!geometries[node.geometry]) {
            console.error("Node geometry not found.");
            return;
        }

        gl.useProgram(this.defaultShader.program);
        gl.bindVertexArray(this.getVAO(node.geometry));
        
        gl.activeTexture(gl.TEXTURE0 + 0);
        if (!node.texture) {
            gl.bindTexture(gl.TEXTURE_2D, null);
        } else {
            gl.bindTexture(gl.TEXTURE_2D, this.getTexture(node.texture));
        }

        const mpMatrix = this.projectionMatrix.clone().multiplyMatrix(node.modelMatrix);
        gl.uniformMatrix3fv(shader.uniforms.u_mp, false, mpMatrix.elements);

        gl.uniform4fv(shader.uniforms.u_color, node.color);
        gl.uniform1i(shader.uniforms.u_texture, 0);
        gl.uniform1i(shader.uniforms.u_useTexture, node.texture ? 1 : 0);

        const drawMethod = gl[geometries[node.geometry].drawMethod];
        gl.drawArrays(drawMethod, 0, geometries[node.geometry].vertexCount);

        const err = gl.getError();
        if (err !== gl.NO_ERROR) {
            console.error("WebGL error:", err);
        }

        gl.bindVertexArray(null);
    }
}

function getWebGL2Context(canvas) {
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("Failed to get WebGL2 context.");
    return gl;
}

/****************************************************************************************************/

class Shader {

    constructor(gl, vertexSource, fragmentSource, attributes, uniforms) {
        const vs = this.createShader(gl, gl.VERTEX_SHADER, vertexSource);
        const fs = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
        this.program = this.createProgram(gl, vs, fs);

        this.attributes = {};
        attributes.forEach(name => {
            this.attributes[name] = gl.getAttribLocation(this.program, name);
        });

        this.uniforms = {};
        uniforms.forEach(name => {
            this.uniforms[name] = gl.getUniformLocation(this.program, name);
        });
    }

    createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return shader;
        }
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
            return program;
        }
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }
}