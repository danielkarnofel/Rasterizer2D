import Node from '../core/Node.js';
import Scene from '../core/Scene.js';

export function squares() {

    const scene = new Scene();
    scene.clearColor = [0.05, 0.05, 0.05, 1];

    const n = 10;
    const w = 500;
    const l = w / n;

    for (let i = 0; i < n; i++) {

        const step = (n - 1) - i;

        for (let j = 0; j < n; j++) {

            const s = new Node('rectangle');
            s.fill = scene.clearColor;
            s.stroke = [0.25, 0.75, 0.25, 1];
            s.strokeWidth = 1;
            s.w = l;
            s.h = l;

            const xOff = (Math.random()*2 - 1);
            const x = l * j - w / 2 + l / 2;
            s.x = x + xOff*step;

            const yOff = (Math.random()*2 - 1);
            const y = l * i - w / 2 + l / 2;
            s.y = y + yOff*step;

            const rOff = (Math.random()*2 - 1);
            const r = 0;
            s.r = r + rOff*step*2;

            scene.add([s]);
        }
    }

    return scene;
}

export function flower() {

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

export function robot() {

    const scene = new Scene();
    scene.clearColor = [0.6, 0.7, 0.7, 1.0];

    const robotColor = [0.5, 0.5, 0.5, 1.0];
    const robotColor2 = [0.2, 0.2, 0.2, 1.0];
    const accentColor = [0.8, 0.1, 0.1, 1.0];

    // Head
    const head = new Node('rectangle');
    head.fill = robotColor;
    head.strokeWidth = 2;
    head.w = 80;
    head.h = 80;
    head.y = 110;

    // Eyes
    const leftEye = new Node('ellipse');
    leftEye.fill = accentColor;
    leftEye.w = 8;
    leftEye.h = 8;
    leftEye.x = -20;
    leftEye.y = 110;

    const rightEye = new Node('ellipse');
    rightEye.fill = accentColor;
    rightEye.w = 8;
    rightEye.h = 8;
    rightEye.x = 20;
    rightEye.y = 110;

    // Mouth
    const mouth = new Node('rectangle');
    mouth.fill = robotColor2;
    mouth.w = 20;
    mouth.h = 5;
    mouth.y = 90;

    // Antenna
    const antennaBase1 = new Node('triangle');
    antennaBase1.fill = robotColor2;
    antennaBase1.w = 10;
    antennaBase1.h = 30;
    antennaBase1.x = -50;
    antennaBase1.y = 115;
    antennaBase1.r = 90;

    const antennaTop1 = new Node('ellipse');
    antennaTop1.fill = accentColor;
    antennaTop1.w = 10;
    antennaTop1.h = 10;
    antennaTop1.x = -60;
    antennaTop1.y = 115;

    const antennaBase2 = new Node('triangle');
    antennaBase2.fill = robotColor2;
    antennaBase2.w = 10;
    antennaBase2.h = 30;
    antennaBase2.x = 50;
    antennaBase2.y = 115;
    antennaBase2.r = 270;

    const antennaTop2 = new Node('ellipse');
    antennaTop2.fill = accentColor;
    antennaTop2.w = 10;
    antennaTop2.h = 10;
    antennaTop2.x = 60;
    antennaTop2.y = 115;

    // Neck
    const neck = new Node('rectangle');
    neck.fill = robotColor2;
    neck.strokeWidth = 2;
    neck.w = 20;
    neck.h = 30;
    neck.y = 65;

    // Body
    const body = new Node('rectangle');
    body.fill = robotColor;
    body.strokeWidth = 2;
    body.w = 100;
    body.h = 120;
    body.y = 0;

    // Arms
    const leftArm = new Node('rectangle');
    leftArm.fill = robotColor2;
    leftArm.strokeWidth = 2;
    leftArm.w = 25;
    leftArm.h = 100;
    leftArm.x = -60;
    leftArm.y = 10;
    leftArm.r = 45;

    const rightArm = new Node('rectangle');
    rightArm.fill = robotColor2;
    rightArm.strokeWidth = 2;
    rightArm.w = 25;
    rightArm.h = 100;
    rightArm.x = 60;
    rightArm.y = 10;
    rightArm.r = -45;

    // Legs
    const leftLeg = new Node('rectangle');
    leftLeg.fill = robotColor2;
    leftLeg.strokeWidth = 2;
    leftLeg.w = 30;
    leftLeg.h = 90;
    leftLeg.x = -25;
    leftLeg.y = -90;

    const rightLeg = new Node('rectangle');
    rightLeg.fill = robotColor2;
    rightLeg.strokeWidth = 2;
    rightLeg.w = 30;
    rightLeg.h = 90;
    rightLeg.x = 25;
    rightLeg.y = -90;

    const floor = new Node('rectangle');
    floor.fill = [0.5, 0.75, 0.5, 1.0];
    floor.w = 600;
    floor.h = 300;
    floor.y = -150;

    // Assemble by draw order
    scene.add([floor]);
    scene.add([neck, leftArm, rightArm, leftLeg, rightLeg]);
    scene.add([antennaBase1, antennaBase2, antennaTop1, antennaTop2]);
    scene.add([head, body]);
    scene.add([leftEye, rightEye, mouth]);

    return scene;
}
