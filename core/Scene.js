import Node from './Node.js';

export default class Scene {

    constructor() {
        this.clearColor = [0.2, 0.2, 0.2, 1.0];
        this.root = new Node();
    }

    add(nodes) {
        for (const node of nodes) {
            this.root.addChild(node);
        }
    }

    remove(node) {
        this.root.removeChild(node);
    }

    update() {
        this.root.update();
    }

    flattenPainters(node = this.root, opaque = [], transparent = []) {
        if (node.isDrawable) {
            node.fill[3] < 1.0 ? transparent.push(node) : opaque.push(node);
        }
        for (const child of node.children) {
            this.flatten(child, opaque, transparent);
        }
        return {opaqueList: opaque, transparentList: transparent};
    }

    flatten(node = this.root, list = []) {
        if (node.isDrawable) {
            list.push(node);
        }
        for (const child of node.children) {
            this.flatten(child, list);
        }
        return list;
    }
}