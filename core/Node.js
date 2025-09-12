import Matrix3 from '../math/Matrix3.js';

export default class Node {

    constructor(geometry, color = new Color(), texture = null) {

        // Scene graph
        this.parent = null;
        this.children = [];
        this.zIndex = 0;
        this.isDrawable = geometry ? true : false;

        // Transformation
        this.w = 1;
        this.h = 1;
        this.x = 0;
        this.y = 0;
        this.r = 0;
        this.modelMatrix = new Matrix3();

        // Appearance
        this.geometry = geometry;
        this.color = color
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