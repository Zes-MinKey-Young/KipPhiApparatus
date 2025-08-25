
class Coordinate {
    constructor(public readonly x: number, public readonly y: number) {
    }
    mul(matrix: Matrix) {
        const {x, y} = this;
        return new Coordinate(x * matrix.a + y * matrix.c + matrix.e, x * matrix.b + y * matrix.d + matrix.f);
    }
    static from([x, y]: [number, number]) {
        return new Coordinate(x, y);
    }
}


class Matrix {
    constructor(public readonly a: number, public readonly b: number,
                public readonly c: number, public readonly d: number,
                public readonly e: number, public readonly f: number) {}
    rotate(angle: number) {
        const {a, b, c, d, e, f} = this;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Matrix(a *  cos + c * sin, b *  cos + d * sin,
                          a * -sin + c * cos, b * -sin + d * cos,
                                           e,                  f);
    }
    translate(x: number, y: number) {
        const {a, b, c, d, e, f} = this;
        return new Matrix(a, b, c, d, a * x + c * y + e, b * x + d * y + f);
    }
    scale(x: number, y: number) {
        const {a, b, c, d, e, f} = this;
        return new Matrix(a * x, b * y, c * x, d * y, e, f);
    }
    invert() {
        const {a, b, c, d, e, f} = this;
        const det = a * d - b * c;
        return new Matrix(d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det);
    }
    xmul(x: number, y: number) {
        return x * this.a + y * this.c + this.e;
    }
    ymul(x: number, y: number) {
        return x * this.b + y * this.d + this.f;
    }
    static fromDOMMatrix({a, b, c, d, e, f}: DOMMatrix) {
        return new Matrix(a, b, c, d, e, f)
    }
}

const identity = new Matrix(1, 0, 0, 1, 0, 0);
