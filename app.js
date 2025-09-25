// Imports
import Renderer from './core/Renderer.js';
import Scene from './core/Scene.js';
import Node from './core/Node.js';

import { mouseToCanvas, pick } from './utils/pointer.js';

const canvas = document.querySelector("#canvas");
canvas.width = 600;
canvas.height = 400;

const renderer = new Renderer(canvas);
const scene = new Scene();

// Create nodes
scene.add([]);

// Render scene
renderer.updateAndRender(scene);

// Set up selection
let selected = null;
let selectionBox = null;

canvas.addEventListener('click', (e) => {
  if (selected) { 
    selected = null;
    scene.remove(selectionBox);
  }
  const p = mouseToCanvas(canvas, e);
  selected = pick(scene, p);
  if (selected) {
    selectionBox = selected.getAABB();
    console.log(selectionBox);
    scene.add([selectionBox]);
  }
  renderer.updateAndRender(scene);
});