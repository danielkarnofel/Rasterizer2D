// Imports
import Renderer from './core/Renderer.js';
import Scene from './core/Scene.js';
import Node from './core/Node.js';

import { mouseToCanvas, pick } from './utils/pointer.js';

const canvas = document.querySelector("#canvas");
canvas.width = 600;
canvas.height = 600;

const renderer = new Renderer(canvas);
const scene = new Scene();

// Create test scene
const rect1 = new Node('rectangle');
rect1.fill = [1.0, 0.0, 0.0, 1.0];
rect1.x = -100;
rect1.y = -100;

const rect2 = new Node('rectangle');
rect2.fill = [0.0, 1.0, 0.0, 1.0];
rect2.x = -100;
rect2.y = 100;

const rect3 = new Node('rectangle');
rect3.fill = [0.0, 1.0, 0.0, 1.0];
rect3.x = 100;
rect3.y = -100;

const rect4 = new Node('rectangle');
rect4.fill = [1.0, 0.0, 0.0, 1.0];
rect4.x = 100;
rect4.y = 100;

const circ1 = new Node('ellipse');
circ1.fill = [0.0, 0.0, 1.0, 0.5];
circ1.w = 250;
circ1.h = 250;

scene.add([rect1, rect2, rect3, rect4, circ1]);
renderer.updateAndRender(scene);

// UI

// Tab functionality
document.querySelectorAll(".tab-button").forEach(button => {
	button.addEventListener("click", () => {

		const tabId = button.dataset.tab;

		document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
		button.classList.add("active");

		document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
		document.querySelector(`#${tabId}`).classList.add("active");
	});
});

// Canvas fill color
const canvasFillInput = document.querySelector("#canvas-fill");
canvasFillInput.addEventListener("input", () => {
	const hex = canvasFillInput.value;
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;
	scene.clearColor = [r, g, b, 1.0];
	renderer.updateAndRender(scene);
});

// Canvas opacity
const canvasOpacityInput = document.querySelector("#canvas-opacity");
canvasOpacityInput.addEventListener("input", () => {
	const opacity = Math.max(parseFloat(canvasOpacityInput.value), 100);
	scene.clearColor[3] = opacity;
	renderer.updateAndRender(scene);
});

// Canvas width
const canvasWidthInput = document.querySelector("#canvas-width");
canvasWidthInput.addEventListener("input", () => {
	const width = Math.max(parseInt(canvasWidthInput.value), 100);
	canvas.width = width;
	renderer.resize();
	renderer.updateAndRender(scene);
});

// Canvas height
const canvasHeightInput = document.querySelector("#canvas-height");
canvasHeightInput.addEventListener("input", () => {
	const height = parseInt(canvasHeightInput.value);
	canvas.height = height;
	renderer.resize();
	renderer.updateAndRender(scene);
});

// Add node
const addNodeButton = document.querySelector("#add-node");
const geometrySelect = document.querySelector("#geometry-select");
addNodeButton.addEventListener("click", () => {
	if (!geometrySelect.value) return;
	const newNode = new Node(geometrySelect.value);
	scene.add([newNode]);
	updateNodeList();
	renderer.updateAndRender(scene);
});

// Remove node
// TODO

// Node selection
let selectedNode = null;
let selectionBox = null;
updateNodeList();

function updateNodeList() {
	const nodeList = document.querySelector(".node-list");
	nodeList.innerHTML = '';
	const nodes = scene.flatten();
	nodes.forEach((node, index) => {
		const li = document.createElement("li");
		li.className = "node-item";
		li.dataset.index = index;
		li.textContent = node.geometry;
		if (node === selectedNode) li.classList.add("selected");

		// Set selected node by clicking on list item
		li.addEventListener("click", () => {

			// Deselect if clicking on already selected list item
			if (node === selectedNode) {
				setSelected(null);
				return;
			}
			setSelected(node);
		});
		nodeList.appendChild(li);
	});
}

// Set selected node by clicking on canvas
canvas.addEventListener('click', (e) => {
	const p = mouseToCanvas(canvas, e);
	const node = pick(scene, p, selectionBox);

	// Don't do anything if clicking on already selected node
	if (node === selectedNode) {
		return;
	}
	setSelected(node);
});

function setSelected(node) {
	selectedNode = node;
	setSelectionCanvas(node);
	setSelectionUI(node);
	updatePropertiesPanel(node);
	renderer.updateAndRender(scene);
}

function getOBB(node) {
	const obb = new Node('rectangle');
	obb.fill = [1.0, 1.0, 1.0, 0.0];
	obb.stroke = [1.0, 1.0, 1.0, 1.0];
	obb.strokeWidth = 1.0;
	obb.w = node.w;
	obb.h = node.h;
	obb.x = node.x;
	obb.y = node.y;
	obb.r = node.r;
	return obb;
}

function setSelectionCanvas(node) {
	if (selectionBox) {
		scene.remove(selectionBox);
	}
	if (!node) return;
	selectionBox = getOBB(node);
	scene.add([selectionBox]);
}

function setSelectionUI(node) {
	const items = document.querySelectorAll(".node-item")
	items.forEach(li => li.classList.remove("selected"));
	if (!node) return;
	const nodes = scene.flatten();
	const index = nodes.indexOf(node);
	if (index >= 0) {
		const li = items[index];
		if (li) li.classList.add("selected");
	}
}

function updatePropertiesPanel(node) {
	// TODO
}