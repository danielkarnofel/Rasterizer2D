import Matrix3 from '../math/Matrix3.js';

export default class Node {

    constructor(geometry = null, texture = null) {

        // Scene graph
        this.parent = null;
        this.children = [];
        this.zIndex = 0;
        this.isDrawable = geometry ? true : false;

        // Transformation
        this.w = geometry ? 100.0 : 1.0;
        this.h = geometry ? 100.0 : 1.0;
        this.x = 0;
        this.y = 0;
        this.r = 0;
        this.modelMatrix = new Matrix3();

        // Appearance
        this.geometry = geometry;
        this.fill = [1.0, 1.0, 1.0, 1.0];
        this.stroke = [0.0, 0.0, 0.0, 1.0];
        this.strokeWidth = 0;
        this.texture = texture;
    }

    addChild(node) {
        node.parent = this;
        this.children.push(node);
    }

    removeChild(node) {
        this.children = this.children.filter(c => c !== node);
        node.parent = null;
    }

    addChildren(nodes) {
        for (const node of nodes) {
            this.addChild(node);
        }
    }

    removeChildren(nodes) {
        for (const node of nodes) {
            this.removeChild(node);
        }
    }

    getAABB() {
        const aabb = new Node('rectangle');
        aabb.fill = [1.0, 1.0, 1.0, 0.0];
        aabb.stroke = [1.0, 1.0, 1.0, 1.0];
        aabb.strokeWidth = 1.0;
        aabb.w = this.w;
        aabb.h = this.h;
        aabb.x = this.x;
        aabb.y = this.y;
        aabb.r = this.r;
        return aabb;
    }

    update() {
        const translation = new Matrix3().makeTranslation(this.x, this.y);
        const rotation = new Matrix3().makeRotation(this.r);
        const scale = new Matrix3().makeScale(this.w, this.h);

        this.modelMatrix.makeIdentity()
            .multiplyMatrix(this.parent ? this.parent.modelMatrix : new Matrix3())
            .multiplyMatrix(translation)
            .multiplyMatrix(rotation)
            .multiplyMatrix(scale);

        for (const child of this.children) {
            child.update();
        }
    }
}