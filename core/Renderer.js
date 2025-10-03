import Matrix3 from '../math/Matrix3.js';
import Vector3 from '../math/Vector3.js';

// A 2D WebGL2 renderer.

const vertexShaderSource = `#version 300 es

    uniform mat3 u_mp;
    
    in vec2 a_pos;
    in vec2 a_tex;

    out vec2 v_pos;
    out vec2 v_tex;

    void main() {
        v_pos = a_pos;
        v_tex = a_tex;
        vec3 pos = u_mp * vec3(a_pos, 1.0);
        gl_Position = vec4(pos.xy, 0.0, 1.0);
    }
`;

const fragmentShaderSource = `#version 300 es

    precision highp float;

    uniform vec4 u_fill;
    uniform vec4 u_stroke;
    uniform float u_strokeWidth;
    uniform int u_geometry;
    uniform float u_pxPerLocal;

    uniform sampler2D u_texture;
    uniform bool u_useTexture;

    in vec2 v_pos;
    in vec2 v_tex;

    out vec4 outColor;

    float sdfSquare() {
        vec2 p = v_pos;
        vec2 s = vec2(0.5);
        vec2 d = abs(p) - s;
        return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
    }

    float sdfTriangle() {
        vec2 p = v_pos;
        vec2 p0 = vec2(0.0, -0.5);
        vec2 p1 = vec2(-0.5, 0.5);
        vec2 p2 = vec2(0.5, 0.5);
        vec2 e0 = p1-p0, e1 = p2-p1, e2 = p0-p2;
        vec2 v0 = p -p0, v1 = p -p1, v2 = p -p2;
        vec2 pq0 = v0 - e0*clamp( dot(v0,e0)/dot(e0,e0), 0.0, 1.0 );
        vec2 pq1 = v1 - e1*clamp( dot(v1,e1)/dot(e1,e1), 0.0, 1.0 );
        vec2 pq2 = v2 - e2*clamp( dot(v2,e2)/dot(e2,e2), 0.0, 1.0 );
        float s = sign( e0.x*e2.y - e0.y*e2.x );
        vec2 d = min(min(vec2(dot(pq0,pq0), s*(v0.x*e0.y-v0.y*e0.x)), vec2(dot(pq1,pq1), s*(v1.x*e1.y-v1.y*e1.x))), vec2(dot(pq2,pq2), s*(v2.x*e2.y-v2.y*e2.x)));
        return -sqrt(d.x)*sign(d.y);
    }

    float sdfCircle() {
        vec2 p = v_pos;
        float r = 0.5;
        return length(p) - r;
    }

    void main() {

        vec4 base = u_useTexture ? texture(u_texture, v_tex) * u_fill : u_fill;
        
        if (u_strokeWidth <= 0.0) {
            outColor = base;
            return;
        }

        float d;
        switch (u_geometry) {
            case 0: d = sdfSquare(); break;
            case 1: d = sdfTriangle(); break;
            case 2: d = sdfCircle(); break;
        }

        if (abs(d) <= u_strokeWidth / u_pxPerLocal) {
            outColor = u_stroke;
            return;
        }

        outColor = base;
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
            ["u_mp", "u_fill", "u_stroke", "u_strokeWidth", "u_geometry", "u_pxPerLocal", "u_texture", "u_useTexture"]
        );

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFuncSeparate(
            this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA,  // RGB blend
            this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA         // A blend
        );
    }

    resize() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.projectionMatrix.makeOrthographic(0, this.canvas.width, this.canvas.height, 0);
    }

    clear(c = [0.15, 0.15, 0.15, 0.0]) {
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

    ndcToPixel(v) {
        const pX = (v.x * 0.5 + 0.5) * this.canvas.width;
        const pY = (v.y * 0.5 + 0.5) * this.canvas.height;
        return new Vector3(pX, pY, 1);
    }

    pixelsPerLocalUnit(node) {

        const mp = this.projectionMatrix.clone().multiplyMatrix(node.modelMatrix);

        const clipSpaceOrigin = mp.multiplyVector(new Vector3(0, 0, 1));
        const pixelOrigin = this.ndcToPixel(clipSpaceOrigin); // Isn't this just (canvas.width/2, canvas.height/2) ?

        const clipSpaceX = mp.multiplyVector(new Vector3(1, 0, 1));
        const pixelX = this.ndcToPixel(clipSpaceX);

        const clipSpaceY = mp.multiplyVector(new Vector3(0, 1, 1));
        const pixelY = this.ndcToPixel(clipSpaceY);

        const pixelsPerUnitX = Math.hypot(pixelX.x - pixelOrigin.x, pixelX.y - pixelOrigin.y);
        const pixelsPerUnitY = Math.hypot(pixelY.x - pixelOrigin.x, pixelY.y - pixelOrigin.y);

        return 0.5 * (pixelsPerUnitX + pixelsPerUnitY);
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
            gl.bindTexture(gl.TEXTURE_2D, this.getTexture(node.texture.img));
        }

        const mpMatrix = this.projectionMatrix.clone().multiplyMatrix(node.modelMatrix);
        gl.uniformMatrix3fv(shader.uniforms.u_mp, false, mpMatrix.elements);

        gl.uniform4fv(shader.uniforms.u_fill, node.fill);
        gl.uniform4fv(shader.uniforms.u_stroke, node.stroke);
        gl.uniform1f(shader.uniforms.u_strokeWidth, node.strokeWidth);

        const pxPerLocal = this.pixelsPerLocalUnit(node);
        gl.uniform1f(shader.uniforms.u_pxPerLocal, pxPerLocal);

        let g;
        switch (node.geometry) {
            case 'rectangle': g = 0; break;
            case 'triangle': g = 1; break;
            case 'ellipse': g = 2; break;
        }
        gl.uniform1i(shader.uniforms.u_geometry, g);

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
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false });
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