import Vector3 from '../math/Vector3.js';

export function pick(scene, point, selectionBox = null) {
    const list = scene.flatten();
    list.sort((a, b) => a.zIndex - b.zIndex);
    for (let i = list.length - 1; i >= 0; i--) {
        const node = list[i];
        if (node === selectionBox) continue;
        if (hit(node, point)) {
            return node;
        }
    }
    return null;
}

export function mouseToCanvas(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (event.clientX - rect.left) * scaleX;
    const py = (event.clientY - rect.top) * scaleY;
    return { x: px - canvas.width/2, y: (canvas.height - py) - canvas.height/2 };
}

function hit(node, p) {
    const i = node.modelMatrix.clone().inverse();
    const l = i.multiplyVector(new Vector3(p.x, p.y, 1));
    switch (node.geometry) {
        case 'rectangle': return hitRectangle(l);
        case 'triangle': return hitTriangle(l);
        case 'ellipse': return hitEllipse(l);
    }
}

function hitRectangle(p) {
    return Math.abs(p.x) <= 0.5 && Math.abs(p.y) <= 0.5;
}

function hitTriangle(p) {
    const A = { x: 0.0, y: -0.5 };
    const B = { x: -0.5, y: 0.5 };
    const C = { x: 0.5, y: 0.5 };

    const v0 = { x: C.x - A.x, y: C.y - A.y };
    const v1 = { x: B.x - A.x, y: B.y - A.y };
    const v2 = { x: p.x - A.x, y: p.y - A.y };

    const den = v0.x * v1.y - v1.x * v0.y;

    const u = (v2.x * v1.y - v1.x * v2.y) / den;
    const v = (v0.x * v2.y - v2.x * v0.y) / den;
    const w = 1 - u - v;

    return u >= 0 && v >= 0 && w >= 0;
}

function hitEllipse(p) {
    const nx = p.x / 0.5;
    const ny = p.y / 0.5;
    return (nx * nx + ny * ny) <= 1
}