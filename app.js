// Imports
import Renderer from './core/Renderer.js';
import Scene from './core/Scene.js';
import Node from './core/Node.js';
import { rgbToHex, hexToRgb } from './utils/color.js';
import { mouseToCanvas, pick } from './utils/pointer.js';
import { robot, squares, flower } from './scenes/testScenes.js';

const canvas = document.querySelector("#canvas");
canvas.width = 600;
canvas.height = 600;

const renderer = new Renderer(canvas);

// Create test scene
//===========================================================================================
let scene = new Scene();
renderer.updateAndRender(scene);
//===========================================================================================

// Test scene buttons
//===========================================================================================
const robotButton = document.querySelector("#robot");
robotButton.addEventListener("click", () => {
	scene = robot();
	renderer.updateAndRender(scene);
	updateNodeList();
	updateScenePanel();
});

const flowerButton = document.querySelector("#flower");
flowerButton.addEventListener("click", () => {
	scene = flower();
	renderer.updateAndRender(scene);
	updateNodeList();
	updateScenePanel();
});

const squaresButton = document.querySelector("#squares");
squaresButton.addEventListener("click", () => {
	scene = squares();
	renderer.updateAndRender(scene);
	updateNodeList();
	updateScenePanel();
});

// Tab functionality
//===========================================================================================
document.querySelectorAll(".tab-button").forEach(button => {
	button.addEventListener("click", () => {

		const tabId = button.dataset.tab;

		document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
		button.classList.add("active");

		document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
		document.querySelector(`#${tabId}`).classList.add("active");
	});
});
//===========================================================================================

// Scene UI
//===========================================================================================

// Canvas fill color
const canvasFillInput = document.querySelector("#canvas-fill");
canvasFillInput.addEventListener("input", () => {
	const hex = canvasFillInput.value;
	const rgb = hexToRgb(hex);
	scene.clearColor = [rgb[0], rgb[1], rgb[2], 1.0];
	renderer.updateAndRender(scene);
});

// Canvas opacity
const canvasOpacityInput = document.querySelector("#canvas-opacity");
canvasOpacityInput.addEventListener("input", () => {
	const opacity = canvasOpacityInput.value;
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

// Clear
const clearButton = document.querySelector("#clear");
clearButton.addEventListener("click", () => {
	scene = new Scene();
	renderer.updateAndRender(scene);
	updateNodeList();
	updateScenePanel();
});

// Export
const exportButton = document.querySelector("#export");
exportButton.addEventListener("click", () => {
	const link = document.getElementById("download-link");
	link.href = canvas.toDataURL();
	link.download = "canvas.png";
	link.click();
});

function updateScenePanel() {
	canvasFillInput.value = rgbToHex(scene.clearColor[0], scene.clearColor[2], scene.clearColor[2]);
	canvasOpacityInput.value = scene.clearColor[3];
	canvasWidthInput.value = canvas.width;
	canvasHeightInput.value = canvas.height;
}

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

		// Node control buttons
		const buttonContainer = document.createElement("div");
		buttonContainer.className = "button-container";
		li.appendChild(buttonContainer);

		const hideButton = document.createElement("button");
		hideButton.className = "node-button";
		hideButton.textContent = "◐";
		hideButton.title = "Visibility";
		buttonContainer.appendChild(hideButton);
		hideButton.addEventListener("click", (e) => {
			e.stopPropagation();
			node.isDrawable = node.isDrawable ? false : true;
			renderer.updateAndRender(scene);
		});

		const deleteButton = document.createElement("button");
		deleteButton.className = "node-button";
		deleteButton.textContent = "✕";
		deleteButton.title = "Delete node";
		buttonContainer.appendChild(deleteButton);
		deleteButton.addEventListener("click", (e) => {
			e.stopPropagation();
			scene.remove(node);
			if (node === selectedNode) {
				setSelected(null);
			}
			updateNodeList();
			renderer.updateAndRender(scene);
		});

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
	if (!selectionBox) {
		selectionBox = new Node('rectangle');
	}
	const obb = selectionBox;
	obb.fill = [1.0, 1.0, 1.0, 0.0];
	obb.stroke = [1.0, 1.0, 1.0, 1.0];
	obb.strokeWidth = 1.0;
	obb.w = node.w;
	obb.h = node.h;
	obb.x = node.x;
	obb.y = node.y;
	obb.r = node.r;
	obb.zIndex = Infinity;
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

//===========================================================================================

// Properties UI
//===========================================================================================

const nodeFillColor = document.querySelector("#fill-color");
nodeFillColor.addEventListener("input", () => {
	if (!selectedNode) return;
	const rgb = hexToRgb(nodeFillColor.value);
	selectedNode.fill = [rgb[0], rgb[1], rgb[2], selectedNode.fill[3]];
	renderer.updateAndRender(scene);
});

const nodeFillOpacity = document.querySelector("#fill-opacity");
nodeFillOpacity.addEventListener("input", () => {
	if (!selectedNode) return;
	const opacity = Math.max(parseFloat(nodeFillOpacity.value), 0.0);
	selectedNode.fill[3] = opacity;
	renderer.updateAndRender(scene);
});

const nodeStrokeColor = document.querySelector("#stroke-color");
nodeStrokeColor.addEventListener("input", () => {
	if (!selectedNode) return;
	const rgb = hexToRgb(nodeStrokeColor.value);
	selectedNode.stroke = [rgb[0], rgb[1], rgb[2], selectedNode.stroke[3]];
	renderer.updateAndRender(scene);
});

const nodeStrokeOpacity = document.querySelector("#stroke-opacity");
nodeStrokeOpacity.addEventListener("input", () => {
	if (!selectedNode) return;
	const opacity = Math.max(parseFloat(nodeStrokeOpacity.value), 0.0);
	selectedNode.stroke[3] = opacity;
	renderer.updateAndRender(scene);
});

const nodeStrokeWidth = document.querySelector("#stroke-width");
nodeStrokeWidth.addEventListener("input", () => {
	if (!selectedNode) return;
	const width = Math.max(parseFloat(nodeStrokeWidth.value), 0.0);
	selectedNode.strokeWidth = width;
	renderer.updateAndRender(scene);
});

const nodeXPosition = document.querySelector("#position-x");
nodeXPosition.addEventListener("input", () => {
	if (!selectedNode) return;
	const x = parseFloat(nodeXPosition.value);
	selectedNode.x = x;
	selectionBox = getOBB(selectedNode);
	renderer.updateAndRender(scene);
});

const nodeYPosition = document.querySelector("#position-y");
nodeYPosition.addEventListener("input", () => {
	if (!selectedNode) return;
	const y = parseFloat(nodeYPosition.value);
	selectedNode.y = y;
	selectionBox = getOBB(selectedNode);
	renderer.updateAndRender(scene);
});

const nodeWScale = document.querySelector("#scale-w");
nodeWScale.addEventListener("input", () => {
	if (!selectedNode) return;
	const w = Math.max(parseFloat(nodeWScale.value), 1.0);
	selectedNode.w = w;
	selectionBox = getOBB(selectedNode);
	renderer.updateAndRender(scene);
});

const nodeHScale = document.querySelector("#scale-h");
nodeHScale.addEventListener("input", () => {
	if (!selectedNode) return;
	const h = Math.max(parseFloat(nodeHScale.value), 1.0);
	selectedNode.h = h;
	selectionBox = getOBB(selectedNode);
	renderer.updateAndRender(scene);
});

const nodeRotation = document.querySelector("#rotation");
nodeRotation.addEventListener("input", () => {
	if (!selectedNode) return;
	const r = parseFloat(nodeRotation.value);
	selectedNode.r = r;
	selectionBox = getOBB(selectedNode);
	renderer.updateAndRender(scene);
});

const nodeZIndex = document.querySelector("#z-index");
nodeZIndex.addEventListener("input", () => {
	if (!selectedNode) return;
	const z = parseInt(nodeZIndex.value);
	selectedNode.zIndex = z;
	selectionBox = getOBB(selectedNode);
	renderer.updateAndRender(scene);
});

function updatePropertiesPanel(node) {
	nodeFillColor.value = node ? rgbToHex(node.fill[0], node.fill[1], node.fill[2]) : '#000000';
	nodeFillOpacity.value = node ? node.fill[3] : 1.0;
	nodeTextureSelect.value = (node && node.texture) ? node.texture.id : "";
	nodeStrokeColor.value = node ? rgbToHex(node.stroke[0], node.stroke[1], node.stroke[2]) : '#000000';
	nodeStrokeOpacity.value = node ? node.stroke[3] : 1.0;
	nodeStrokeWidth.value = node ? node.strokeWidth : 0.0;
	nodeXPosition.value = node ? node.x : 0;
	nodeYPosition.value = node ? node.y : 0;
	nodeWScale.value = node ? node.w : 0;
	nodeHScale.value = node ? node.h : 0;
	nodeRotation.value = node ? node.r : 0;
	nodeZIndex.value = node ? node.zIndex : 0;
}

//===========================================================================================

// Texture management
const textureList = {};
const nodeTextureSelect = document.querySelector("#texture-select");

function updateTextureList() {
	nodeTextureSelect.innerHTML = '<option value="">None</option>';
	for (const id in textureList) {
		const option = document.createElement("option");
		option.value = id;
		const urlParts = textureList[id].img.src.split("/");
		option.textContent = urlParts[urlParts.length-1];
		nodeTextureSelect.appendChild(option);
	}
}

// Preloaded textures
const dogTexture = {id: 1, img: new Image()};
dogTexture.img.src = './assets/dog.png';
dogTexture.img.onload = () => {
	textureList[dogTexture.id] = dogTexture;
	updateTextureList();
}
const catTexture = {id: 2, img: new Image()};
catTexture.img.src = './assets/cat.png';
catTexture.img.onload = () => {
	textureList[catTexture.id] = catTexture;
	updateTextureList();
}

nodeTextureSelect.addEventListener('change', () => {
	if (!selectedNode) return;
	const id = nodeTextureSelect.value;
	if (id === "") { 
		selectedNode.texture = null; 
	} else { 
		selectedNode.texture = textureList[id];
	}
	renderer.updateAndRender(scene);
});

updatePropertiesPanel();
