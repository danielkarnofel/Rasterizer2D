import Matrix3 from '../math/Matrix3.js';
import Color from '../utils/Color.js';

// A 2D WebGL2 renderer.

export default class Renderer {

    constructor(canvas) {
        this.canvas = canvas;
        this.gl = getWebGL2Context(canvas);
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.projectionMatrix = new Matrix3().makeProjection(0, canvas.width, canvas.height, 0);
    }

    resize() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.projectionMatrix = new Matrix3().makeProjection(0, this.canvas.width, this.canvas.height, 0);
    }

    clear(c = new Color()) {
        this.gl.clearColor(c.r, c.g, c.b, c.a);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    render(scene) {
        this.clear(scene.clearColor);
        const drawList = scene.flatten();
        for (const node of drawList) {
            this.drawNode(node);
        }
    }

    drawNode(node) {

    }
}

function getWebGL2Context(canvas) {
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("Failed to get WebGL2 context.");
    return gl;
}