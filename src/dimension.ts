export interface IUnitFactors {
  [unit: string]: number;
}

export var UnitFactorsLength: IUnitFactors = {
  "1": 1.0,
  in: 96,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  Q: 96 / 25.4 / 4, // quarter mm
  pc: 96 / 6,
  pt: 96 / 72,
  px: 1.0
};
export var UnitFactorsAngle: IUnitFactors = {
  "1": 1.0,
  rad: 1,
  deg: (2 * Math.PI) / 360,
  turn: 2 * Math.PI,
  grad: (2 * Math.PI) / 400
};

export var UnitFactorsDefault: IUnitFactors = {
  ...UnitFactorsAngle,
  ...UnitFactorsLength
};

export type DimensionSpec = IDimension | string | number;

export interface IDimension {
  unit?: string;
  number?: number;
  value(env?: IUnitFactors): number;
  neg(): IDimension;
  plus(delta: DimensionSpec): IDimension;
  minus(delta: DimensionSpec): IDimension;

  resolve(env: IUnitFactors): IDimension;
}

abstract class DimensionBase implements IDimension {
  abstract value(env: IUnitFactors): number;
  abstract unit?: string;
  abstract number?: number;

  abstract neg(): IDimension;
  plus(delta: DimensionSpec): IDimension {
    return new DimensionRelative(this, dimension(delta));
  }
  minus(delta: DimensionSpec): IDimension {
    return new DimensionRelative(this, dimension(delta).neg());
  }

  resolve(env: IUnitFactors) {
    return new DimensionResolved(this, env);
  }
}

abstract class DimensionBaseNeg extends DimensionBase implements IDimension {
  neg(): IDimension {
    if (undefined === this._neg) {
      this._neg = new DimensionNegative(this);
    }
    return this._neg;
  }

  private _neg: IDimension | undefined = undefined;
}

class DimensionResolved extends DimensionBase implements IDimension {
  constructor(dim: IDimension, env: IUnitFactors) {
    super();
    this._dim = dim;
    this._env = env;
  }
  value(env?: IUnitFactors) {
    return this._dim.value(env || this._env);
  }

  get unit() {
    return this._dim.unit;
  }
  get number() {
    return this._dim.number;
  }

  neg() {
    if (undefined === this._neg) {
      let neg = this._dim.neg().resolve(this._env);
      if (neg instanceof DimensionResolved && undefined === neg._neg) {
        neg._neg = this;
      }
      this._neg = neg;
    }
    return this._neg;
  }

  plus(delta: DimensionSpec): IDimension {
    let result = this._dim.plus(delta).resolve(this._env);
    return result;
  }

  minus(delta: DimensionSpec): IDimension {
    let result = this._dim.minus(delta).resolve(this._env);
    return result;
  }

  resolve(env: IUnitFactors): this {
    if (env === this._env) {
      return this;
    }
    return super.resolve(env);
  }

  private _dim: IDimension;
  private _env: IUnitFactors;

  private _neg: IDimension;
}

class DimensionNegative extends DimensionBase implements IDimension {
  constructor(that: IDimension) {
    super();
    this._that = that;
  }

  public get number(): number {
    return -this._that.number;
  }

  public get unit(): string {
    return this._that.unit;
  }

  value(units: IUnitFactors) {
    return -this._that.value(units);
  }

  neg() {
    return this._that;
  }

  private _that: IDimension;
}

class DimensionRelative extends DimensionBaseNeg implements IDimension {
  constructor(ref: IDimension, delta: IDimension) {
    super();
    this._ref = ref;
    this._delta = delta;
  }

  get unit(): string {
    return undefined;
  }
  get number(): number {
    return undefined;
  }
  value(env: IUnitFactors) {
    return this._ref.value(env) + this._delta.value(env);
  }

  private _ref: IDimension;
  private _delta: IDimension;
}

const dimensionRegEx = /^(\-?\d+(?:\.\d*)?)\s*(\w*)$/;

export class Dimension extends DimensionBaseNeg implements IDimension {
  static parse(text: string): IDimension {
    return new Dimension(text);
  }
  static value(text: string, env: IUnitFactors = UnitFactorsDefault): number {
    let [, number, unit] = dimensionRegEx.exec(text);
    let f = env[unit];
    if (null == f) {
      f = 1.0;
    }
    return parseFloat(number) * f;
  }

  public number: number;
  public unit: string;

  constructor(dimension: string);
  constructor(number: number, unit: string);
  constructor(numberOrDimension: number | string, unit?: string) {
    super();
    let numberVal: number;
    let unitVal: string;
    if (arguments.length === 1 && typeof numberOrDimension === "string") {
      let match = dimensionRegEx.exec(numberOrDimension);
      if (match) {
        numberVal = parseFloat(match[1]);
        unitVal = match[2];
      } else {
        throw new Error(`illegal dimension string ${numberOrDimension}`);
      }
    } else if (
      arguments.length === 2 &&
      typeof numberOrDimension === "number"
    ) {
      numberVal = numberOrDimension;
      unitVal = unit;
    } else {
      throw new Error(`illegal arguments (${typeof numberOrDimension})${numberOrDimension}, (${typeof unit})${unit}`);
    }
    this.number = numberVal;
    this.unit = unitVal;
  }

  value(env: IUnitFactors = UnitFactorsDefault) {
    let f = env[this.unit];
    if (null == f) {
      f = 1.0;
    }
    return this.number * f;
  }
}

class DimensionF extends DimensionBaseNeg implements IDimension {
  constructor(
    d1: DimensionSpec,
    d2: DimensionSpec,
    f: (a: number, b: number) => number
  ) {
    super();
    this._d1 = dimension(d1);
    this._d2 = dimension(d2);
    this._f = f;
  }

  value(env: IUnitFactors) {
    return this._f(this._d1.value(env), this._d2.value(env));
  }

  get unit(): string | undefined {
    return undefined;
  }
  get number(): number | undefined {
    return undefined;
  }

  private _d1: IDimension;
  private _d2: IDimension;
  private _f: (a: number, b: number) => number;
}

export function dimension(d: DimensionSpec) {
  if (typeof d === "string") {
    return Dimension.parse(d);
  }
  if (typeof d === "number") {
    return new Dimension(d, "1");
  }
  return d;
}

export function dimensionF(
  d1: DimensionSpec,
  d2: DimensionSpec,
  fun: (a: number, b: number) => number
) {
  return new DimensionF(d1, d2, fun);
}

export type UnitFactorMapper = (key: string) => IUnitFactors;

export function dimensionProxy<X, D, K extends keyof (X & D)>(
  obj: X, 
  defaults: D = { } as D,
  ufm: UnitFactorMapper = () => UnitFactorsDefault
): { [k in K]: IDimension } {
  let cache = {};
  let result = {} as { [k in K]: IDimension };
  let allKeys: Set<string> = new Set(Object.keys(obj).concat(Object.keys(defaults)));
  
  for (let k of allKeys.values()) {
    Object.defineProperty(result, k, {
      configurable: false,
      enumerable: true,
      get: () => {
        if (undefined === cache[k]) {
          const envK = ufm(k);
          const val = undefined !== obj[k] ? obj[k] : defaults[k];
          const valType = typeof val;
          if (
            envK && (
              (valType === 'string' && dimensionRegEx.exec(val))
              || valType === 'number' 
              || (valType === 'object' && typeof val.value === 'function')
            )
          ) {
            cache[k] = dimension(val).resolve(envK);
          } else if (envK && valType === 'object') {
            cache[k] = dimensionProxy(val || {}, defaults[k], ufm);
          } else {
            cache[k] = val;
          }
        }
        return cache[k];
      }
    });
  }
  return result;
}
