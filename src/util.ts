
const A = 16807;;
const M = 2147483647;

export interface IUtilOptions {
  colors?: string[];
  palette?: string[];
}

export class Util {
  
  constructor(seed?: number, options: IUtilOptions = {}) {
    this._seed = +seed || Math.ceil(Math.random()*M) || 229;
    this._restart();
    this._options = { ...options };
    this._colorIndex = 0;
  }
  _restart() {
    this._current = this._seed;
  }
  _minirnd() {
    let current = this._current;
    current = (A * current) % M;
    this._current = current;
    let random = current / M;
    return random;
  }
  _nextrnd() {
    let current = this._current;
    current = (A * current) % M;
    let random = current / M;
    return random;
  }

  rndPreview(minOrMax: number, maxOrMin: number = 0) {
    const min = Math.min(minOrMax, maxOrMin);
    const max = Math.max(minOrMax, maxOrMin);
    return Math.round(this._nextrnd()*(max-min)+min);
  }

  rnd(minOrMax: number, maxOrMin: number = 0) {
    const min = Math.min(minOrMax, maxOrMin);
    const max = Math.max(minOrMax, maxOrMin);
    return Math.round(this._minirnd()*(max-min)+min);
  }
  
  _rndHex(d: number): string {
    const zeroes = '000000000000000';
    const digits = Math.min(d, zeroes.length);
    let v = this.rnd(Math.pow(16,digits)-1).toString(16);
    return zeroes.substr(0, d-v.length)+v;
  }

  b(f: (...args: unknown[]) => string, ...args: unknown[]) {
    return f.bind(this, ...args);
  }
  repeat(f:()=>string, n: number) {
    let result = '';
  
    for (let i = 0; i < n; ++i) {
      result += f();
    }
    return result;
  }

  rndColor() {
    const u = this;
    let override = null;
    const { colors, palette } = this?._options;
    if (colors?.length) {
      const colorIndex = this._colorIndex++;
      override = '#'+colors[colorIndex];
    } else if (palette?.length) {
      const colorIndex = u.rndPreview(229*palette.length) % palette.length;
      override = '#'+palette[colorIndex];
    }
    const color = '#'+u.repeat(u.b(u._rndHex, 2), 3);

    return override ?? color;
  }


  private _seed: number;
  private _current: number;

  private _options: IUtilOptions;
  private _colorIndex: number;
}