
const A = 16807;;
const M = 2147483647;
export class Util {

  
  constructor(seed?: number) {
    this._seed = +seed || Math.ceil(Math.random()*M) || 229;
    this._restart();
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
  rnd(minOrMax: number, maxOrMin: number = 0) {
    const min = Math.min(minOrMax, maxOrMin);
    const max = Math.max(minOrMax, maxOrMin);
    return Math.round(this._minirnd()*(max-min)+min);
  }
  
  rndHex(d: number): string {
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
    return '#'+u.repeat(u.b(u.rndHex, 2), 3)
  }


  private _seed: number;
  private _current: number;
}