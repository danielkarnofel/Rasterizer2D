
export default class Color {

    constructor(r = 1.0, g = 1.0, b = 1.0, a = 1.0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    set(r, g, b, a = 1.0) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        return this;
    }

    static hexToRGB(hex) {
        const r = parseInt(hex.substr(1, 2), 16) / 255.0;
        const g = parseInt(hex.substr(3, 2), 16) / 255.0;
        const b = parseInt(hex.substr(5, 2), 16) / 255.0;
        return new Color(r, g, b);
    }

    static hexToRGBA(hex) {
        const r = parseInt(hex.substr(1, 2), 16) / 255.0;
        const g = parseInt(hex.substr(3, 2), 16) / 255.0;
        const b = parseInt(hex.substr(5, 2), 16) / 255.0;
        const a = parseInt(hex.substr(7, 2), 16) / 255.0;
        return new Color(r, g, b, a);
    }
}