// Imports
import Renderer from './core/Renderer.js';
import Scene from './core/Scene.js';
import Node from './core/Node.js';

const canvas = document.querySelector("#canvas");
canvas.width = 600;
canvas.height = 400;

const renderer = new Renderer(canvas);
const scene = new Scene();

const rect = new Node('rectangle', [1.0, 0.0, 0.0, 1.0]);
rect.w = 100;
rect.h = 50;
rect.x = 100;

const circ = new Node('ellipse', [0.0, 1.0, 0.0, 1.0]);
circ.w = 50;
circ.h = 50;
circ.x = -50;
circ.y = 50;

const tri = new Node('triangle', [0.0, 0.0, 1.0, 1.0]);
tri.w = 50;
tri.h = 75;
tri.x = -50;
tri.y = -50;

const tri2 = new Node('triangle', [0.0, 0.0, 1.0, 1.0]);
tri2.w = 50;
tri2.h = 75;
tri2.x = -150;
tri2.y = -50;

scene.add([rect, circ, tri, tri2]);
renderer.updateAndRender(scene);