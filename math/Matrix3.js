import Vector3 from './Vector3.js';

export default class Matrix3 {

    constructor() {
        this.elements = new Float32Array(9);
        this.makeIdentity();
    }

    clone() {
        const newMatrix = new Matrix3();
        for (let i = 0; i < 9; i++) {
            newMatrix.elements[i] = this.elements[i];
        }
        return newMatrix;
    }

    copy(m) {
        for (let i = 0; i < 9; i++) {
            this.elements[i] = m.elements[i];
        }
        return this;
    }

    // Takes parameters in row-major order, but stores in column-major
    set(m11, m12, m13, m21, m22, m23, m31, m32, m33) {
        const e = this.elements;
        e[0] = m11; e[3] = m12; e[6] = m13;
        e[1] = m21; e[4] = m22; e[7] = m23;
        e[2] = m31; e[5] = m32; e[8] = m33;
        return this;
    }

    makeIdentity() {
        this.set(
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        );
        return this;
    }

    makeScale(x, y) {
        this.set(
            x, 0, 0,
            0, y, 0,
            0, 0, 1
        );
        return this;
    }

    makeRotation(degrees) {
        const radians = degrees * Math.PI / 180;
        const c = Math.cos(radians);
        const s = Math.sin(radians);
        this.set(
            c, s, 0,
            -s, c, 0,
            0, 0, 1
        );
        return this;
    }

    makeTranslation(x, y) {
        this.set(
            1, 0, x,
            0, 1, y,
            0, 0, 1
        );
        return this;
    }

    makeOrthographic(l, r, t, b) {
        this.set(
            2 / (r - l), 0, 0,
            0, 2 / (t - b), 0,
            -(r + l) / (r - l), -(t + b) / (t - b), 1
        );
        return this;
    }

    multiplyScalar(s) {
        for (let i = 0; i < 9; i++) {
            this.elements[i] *= s;
        }
        return this;
    }

    multiplyVector(v) {
        const e = this.elements;
        return new Vector3(
            e[0] * v.x + e[3] * v.y + e[6] * v.z,
            e[1] * v.x + e[4] * v.y + e[7] * v.z,
            e[2] * v.x + e[5] * v.y + e[8] * v.z,
        );
    }

    multiplyMatrix(m) {
        const a = this.elements;
        const b = m.elements;
        this.set(
            (a[0] * b[0] + a[3] * b[1] + a[6] * b[2]), (a[0] * b[3] + a[3] * b[4] + a[6] * b[5]), (a[0] * b[6] + a[3] * b[7] + a[6] * b[8]),
            (a[1] * b[0] + a[4] * b[1] + a[7] * b[2]), (a[1] * b[3] + a[4] * b[4] + a[7] * b[5]), (a[1] * b[6] + a[4] * b[7] + a[7] * b[8]),
            (a[2] * b[0] + a[5] * b[1] + a[8] * b[2]), (a[2] * b[3] + a[5] * b[4] + a[8] * b[5]), (a[2] * b[6] + a[5] * b[7] + a[8] * b[8])
        );
        return this;
    }

    inverse() {
        const e = this.elements;
        const det = e[0] * e[4] * e[8] + e[1] * e[5] * e[6] + e[2] * e[3] * e[7] - e[0] * e[5] * e[7] - e[1] * e[3] * e[8] - e[2] * e[4] * e[6];
        this.set(
            (e[4] * e[8] - e[5] * e[7]) / det, (e[5] * e[6] - e[3] * e[8]) / det, (e[3] * e[7] - e[4] * e[6]) / det,
            (e[2] * e[7] - e[1] * e[8]) / det, (e[0] * e[8] - e[2] * e[6]) / det, (e[1] * e[6] - e[0] * e[7]) / det,
            (e[1] * e[5] - e[2] * e[4]) / det, (e[2] * e[3] - e[0] * e[5]) / det, (e[0] * e[4] - e[1] * e[3]) / det
        );
        return this;
    }

    toString() {
        const e = this.elements;
        return `${e[0]} ${e[3]} ${e[6]}\n${e[1]} ${e[4]} ${e[7]}\n${e[2]} ${e[5]} ${e[8]}`;
    }
}