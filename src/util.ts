
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
      const colorIndex = this._colorIndex++ % colors.length;
      override = colors[colorIndex];
    } else if (palette?.length) {
      const colorIndex = u.rndPreview(229*palette.length) % palette.length;
      override = palette[colorIndex];
    }
    const color = '#'+u.repeat(u.b(u._rndHex, 2), 3);

    return override ?? color;
  }

  rndColorRGB(): {r:number,g:number,b:number,a:number} {
    const u = this;
    let override = null;
    const { colors, palette } = this?._options;
    if (colors?.length) {
      const colorIndex = this._colorIndex++ % colors.length;
      override = colors[colorIndex];
    } else if (palette?.length) {
      const colorIndex = u.rndPreview(229*palette.length) % palette.length;
      override = palette[colorIndex];
    }

    let r,g,b,a;
    r = u.rnd(255);
    g = u.rnd(255);
    b = u.rnd(255);
    a = 255;
    if (override) {
      [ r,g,b,a ] = parseColor(override);
    }
    return { r,g,b,a };
  }

  private _seed: number;
  private _current: number;

  private _options: IUtilOptions;
  private _colorIndex: number;
}

function parseColor(color: string) {
  let r,g,b,a;

  if (color.startsWith('#')) {
    switch (color.length) {
      case 4:
        r = Number.parseInt(color.substring(1,2), 16)*0x11;
        g = Number.parseInt(color.substring(2,3), 16)*0x11;
        b = Number.parseInt(color.substring(3,4), 16)*0x11;
        a = 0xff;
        break;
      case 5:
        r = Number.parseInt(color.substring(1,2), 16)*0x11;
        g = Number.parseInt(color.substring(2,3), 16)*0x11;
        b = Number.parseInt(color.substring(3,4), 16)*0x11;
        a = Number.parseInt(color.substring(4,5), 16)*0x11;
        break;
      case 7:
        r = Number.parseInt(color.substring(1,3), 16);
        g = Number.parseInt(color.substring(3,5), 16);
        b = Number.parseInt(color.substring(5,7), 16);
        a = 0xff;
        break;
      case 9:
        r = Number.parseInt(color.substring(1,3), 16);
        g = Number.parseInt(color.substring(3,5), 16);
        b = Number.parseInt(color.substring(5,7), 16);
        a = Number.parseInt(color.substring(7,9), 16);
        break;
    }
  }

  return [ r,g,b,a ];
}