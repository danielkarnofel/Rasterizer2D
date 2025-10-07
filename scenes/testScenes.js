import Node from '../core/Node.js';
import Scene from '../core/Scene.js';

export function createTestScene1() {

    const scene = new Scene();
    scene.clearColor = [0.05, 0.05, 0.05, 1];

    const n = 10;
    const w = 500;
    const l = w / n;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            const s = new Node('rectangle');
            s.fill = scene.clearColor;
            s.stroke = [0.25, 0.75, 0.25, 1];
            s.strokeWidth = 1;
            s.w = l;
            s.h = l;
            s.x = l * j - w / 2 + l / 2;
            s.y = l * i - w / 2 + l / 2;
            s.r = (Math.random() * 2 - 1) * 3 * (n - i - 1);
            scene.add([s]);
        }
    }

    return scene;
}

export function createTestScene2() {

    const scene = new Scene();

    const petalSize = 20;
    const totalPetals = 300;
    const scale = 15;
    const goldenAngle = 137.5 * Math.PI / 180;

    for (let i = 1; i < totalPetals; i++) {

        const angle = i * goldenAngle;
        const radius = scale * Math.sqrt(i);

        const petal = new Node('ellipse');
        const t = i / totalPetals;
        const r = 0.5 + 0.5 * Math.sin(2 * Math.PI * (t + 0.00));
        const g = 0.5 + 0.5 * Math.sin(2 * Math.PI * (t + 0.33));
        const b = 0.5 + 0.5 * Math.sin(2 * Math.PI * (t + 0.66));
        petal.fill = [r, g, b, 1.0];
        petal.w = petalSize;
        petal.h = petalSize;
        petal.x = radius * Math.cos(angle);
        petal.y = radius * Math.sin(angle);

        scene.add([petal]);
    }

    return scene;
}