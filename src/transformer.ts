export interface ITuple {
  x:number;
  y:number;
}

export interface ITransform {
  transform(p:ITuple):ITuple;
}

function eq(a:number, b:number, delta:number=1e-15) {
  return Math.abs(a-b) < delta;
}

function printNumber(n:number, f:number) { return f.toFixed(n); }

export class Transform {
  private static DELTA=1e-15;

  private _m11:number; private _m12:number; //m13 = 0
  private _m21:number; private _m22:number; //m23 = 0
  private _m31:number; private _m32:number; //m33 = 1


  constructor(
      m11:number,m12:number,
      m21:number,m22:number,
      m31:number,m32:number
  ) {
    this._m11 = m11;
    this._m12 = m12;
    this._m21 = m21;
    this._m22 = m22;
    this._m31 = m31;
    this._m32 = m32;
  }

  toSVGString() {
    var p = printNumber.bind(null, 4);
    var m11 = this._m11;
    var m12 = this._m12;
    var m21 = this._m21;
    var m22 = this._m22;
    var m31 = this._m31;
    var m32 = this._m32;

    if (1 == m11 && 0 == m12 && 0 == m21 && 1 == m22) {
      return 'translate('+p(m31)+','+p(m32)+')';
    } else if (0 != m11 && 0 == m12 && 0 == m21 && 0 != m22 && 0 == m31 && 0 == m32) {
      return 'scale('+p(m11)+','+p(m22)+')';
    } else {
      return 'matrix('+p(m11)+','+p(m12)+', '+p(m21)+','+p(m22)+', '+p(m31)+','+p(m32)+')';
    }
  }

  equals(that:Transform) {
    return (
        eq(this._m11, that._m11, Transform.DELTA)
        && eq(this._m12, that._m12, Transform.DELTA)
        && eq(this._m21, that._m21, Transform.DELTA)
        && eq(this._m22, that._m22, Transform.DELTA)
        && eq(this._m31, that._m31, Transform.DELTA)
        && eq(this._m32, that._m32, Transform.DELTA)
    );
  }

  transform(p:ITuple):ITuple {
    return {
      x: p.x * this._m11 + p.y * this._m21 + this._m31,
      y: p.y * this._m12 + p.y * this._m22 + this._m32
    };
  }

  concat(that:Transform):Transform {
    var b = that;
    var a = this;

    return new Transform(
        a._m11 * b._m11 + a._m12 * b._m21,
        a._m11 * b._m12 + a._m12 * b._m22,

        a._m21 * b._m11 + a._m22 * b._m21,
        a._m21 * b._m12 + a._m22 * b._m22,

        a._m31 * b._m11 + a._m32 * b._m21 + b._m31,
        a._m31 * b._m12 + a._m32 * b._m22 + b._m32
    );
  }

  rotate(a):Transform {
    return this.concat(Transform.rotator(a));
  }
  rotateAt(a,x,y):Transform {
    return this.translate(-x,-y).rotate(a).translate(x,y);
  }
  scale(xs,ys):Transform {
    return this.concat(Transform.scalor(xs,ys));
  }
  scaleAt(xs,ys,x,y):Transform {
    return this.translate(-x,-y).scale(xs,ys).translate(x,y);
  }
  translate(x,y):Transform {
    return this.concat(Transform.translator(x,y));
  }

  mirrorX():Transform {
    return this.scale(-1,1);
  }
  mirrorXAt(x,y):Transform {
    return this.translate(-x,-y).mirrorX().translate(x,y);
  }
  mirrorY():Transform {
    return this.scale(1,-1);
  }
  mirrorYAt(x,y):Transform {
    return this.translate(-x,-y).mirrorY().translate(x,y);
  }

  inverse() {
    var t = this;
    var det = t._m11*t._m22-t._m12*t._m21;

    if (det == 0) {
      throw new Error("non-invertible transform");
    }

    var s = 1/det;

    return new Transform(
        s*t._m22, s*-t._m12,
        s*-t._m21, s*t._m11,
        s*(t._m21*t._m32-t._m22*t._m31),
        s*(t._m12*t._m31-t._m11*t._m32)
    );
  }

  apply(ctx:CanvasRenderingContext2D) {
    var t = this;
    ctx.transform(t._m11, t._m12, t._m21, t._m22, t._m31, t._m32);
  }

  static identity() {
    return new Transform(1,0,0,1,0,0);
  }
  static rotator(a:number) {
    return new Transform(
        Math.cos(a), Math.sin(a),
        -Math.sin(a), Math.cos(a),
        0,      0
    );
  }
  static translator(x:number, y:number) {
    return new Transform(
        1, 0,
        0, 1,
        x, y
    );
  }
  static scalor(xs:number, ys:number) {
    return new Transform(
        xs, 0,
        0, ys||xs,
        0, 0
    );
  }
}