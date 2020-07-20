import { Util } from "./util";
import { Transform } from './transformer';

export interface IPainterContext {
  context: CanvasRenderingContext2D;
  u: Util;
  xs: number;
  ys: number;
}
export interface Painter {
  (ctx: IPainterContext): void;
}


export const PAINTERS: { [key: string]: Painter } = {
  grad: renderGradient,
  pxls: renderPixels,
  poly: renderPoly,
  ngon: renderNGon,
  rect: renderRect,
  lclr: renderLightColors,
  dclr: renderDarkColors,
  mclr: renderMixedColors,
};


export function renderPixels(pctx: IPainterContext) {
  const { context, u, xs, ys } = pctx;

  let imagedata = context.createImageData(xs,ys);

  var i = 0;
  var data = imagedata.data;
  for (var y = 0; y < ys; ++y) {
    for (var x = 0; x < xs; ++x) {
      data[i++] = u.rnd(0, 255);
      data[i++] = u.rnd(0, 255);
      data[i++] = u.rnd(0, 255);
      data[i++] = 255; // alpha = 1
    }
  }

  context.putImageData(imagedata, 0, 0,)
}

export function renderGradient(pctx: IPainterContext) {
  const { context, u, xs, ys } = pctx;


  const mode = u.rnd(1,4);

  let gradient: CanvasGradient;
  if (mode == 1) {
    gradient = context.createRadialGradient(
      xs/2, ys/2, 0, 
      xs/2, ys/2, Math.max(xs,ys) 
    );
  } else if (mode == 2) {
    const xc = u.rnd(xs-1);
    const yc = u.rnd(ys-1);
    gradient = context.createRadialGradient(
      xc, yc, 0, 
      xc, yc, Math.max(xs,ys) 
    );
  } else {
    let x0, y0, x1, y1;
    if (mode === 3) {
      const a = u.rnd(xs);
      const b = u.rnd(xs);
      x0 = a; y0 = 0;
      x1 = b; y1 = ys-1;
    } else {
      const a = u.rnd(ys);
      const b = u.rnd(ys);
      x0 = 0;  y0 = a;
      x1 = xs-1; y1 = b;
    }

    gradient = context.createLinearGradient(x0, y0, x1, y1);
  
  }
  const stops = u.rnd(2,5);
  for (let s = 0; s < stops; ++s) {
    gradient.addColorStop(s/(stops-1), u.rndColor());
  }

  context.fillStyle = gradient;
  context.fillRect(0,0,xs,ys);

}

export function renderPoly(pctx: IPainterContext) {
  const { context, u, xs, ys } = pctx;

  context.fillStyle = '#'+u.repeat(u.b(u.rndHex,2),3);
  context.fillRect(0,0,xs,ys);

  context.fillStyle = '#'+u.repeat(u.b(u.rndHex,2),3);
  context.strokeStyle = '#'+u.repeat(u.b(u.rndHex,2),3);
  context.beginPath();
  const count = u.rnd(3,9);
  for (var i = 0; i < count; ++i) {
    const x = u.rnd(xs);
    const y = u.rnd(ys);
    if (i === 0) context.moveTo(x,y);
    else context.lineTo(x,y);
  }
  context.closePath();
  context.fill();
  context.stroke();
}

export function renderRect(pctx: IPainterContext) {
  const { context, u, xs, ys } = pctx;

  context.fillStyle = '#'+u.repeat(u.b(u.rndHex,2),3);
  context.fillRect(0,0,xs,ys);

  const count = u.rnd(1,9);
  for (var i = 0; i < count; ++i) {
    const x = u.rnd(xs/2);
    const y = u.rnd(ys/2);
    const w = u.rnd(xs);
    const h = u.rnd(ys);

    context.fillStyle = '#'+u.repeat(u.b(u.rndHex,2),3);
    context.strokeStyle = '#'+u.repeat(u.b(u.rndHex,2),3);
    context.fillRect(x,y,w,h);
    context.strokeRect(x,y,w,h);
  }

}


export function renderNGon(pctx: IPainterContext) {
  const { context, u, xs, ys } = pctx;

  const n = u.rnd(3,7);

  const mode = u.rnd(1,4);

  context.fillStyle = u.rndColor();
  context.fillRect(0,0,xs,ys);
  context.beginPath();
  context.save();

  const w2 = xs/2, h2 = ys/2; 
  const r = Math.max(w2,h2);

  const angle = 2*Math.PI / n;
  const rotator = Transform.identity().rotateAt(angle, w2, h2)

  const startAngle = u._minirnd() * 2*Math.PI;
  Transform.identity().rotateAt(startAngle, w2, h2).apply(context);

  const s = h2+u.rnd(r,r/3);

  //console.log(`ngon: n=${n} / s=${s} / r=${r} / w2=${w2} / h2=${h2}`);

  let inner: (first: boolean)=>void;
  switch(mode) {
    default:
      case 0:
        inner = (first) => (first?context.moveTo(w2,s):context.lineTo(w2,s)); 
        break;
      case 1: {
          const m = u.rnd(3, 7);
          const d = [];
          for (let i = 0; i < m; ++i) {
            d.push(u.rnd(1, i*r/m));
          }
          inner = () => {
            context.moveTo(w2,h2);
            for (let i = 0; i < m; ++i) {
              context.lineTo(w2+d[i], h2+i*r/m);
            }
            for (let i = m-1; i >= 0; --i) {
              context.lineTo(w2-d[i], h2+i*r/m);
            }
            context.lineTo(w2,h2);
          }; 
        }
        break;
      case 2:
        inner = (first) => {
          const y = u.rnd(s,s/2);
          if (first) {
            context.moveTo(w2,y)

          } else {
            context.lineTo(w2,y); 
          }
        };
        break;
    }

  inner(true);
  for (var i = 1; i < n; ++i) {
    rotator.apply(context);
    inner(false);
  }

  context.closePath();

  context.fillStyle = u.rndColor();
  context.strokeStyle = u.rndColor();
  context.fill();
  context.stroke();

  context.restore();

}

function distance(a,b) {
  const dx = a.x-b.x;
  const dy = a.y-b.y;

  return Math.sqrt(dx*dx+dy*dy);
} 

function renderPixelColors(pctx, colorFun) {
  const { context, xs, ys } = pctx;

  let imagedata = context.createImageData(xs,ys);

  var i = 0;
  var data = imagedata.data;
  for (var y = 0; y < ys; ++y) {
    for (var x = 0; x < xs; ++x) {
      const [r,g,b] = colorFun(x,y);
      data[i++] = r;
      data[i++] = g;
      data[i++] = b;
      data[i++] = 255; // alpha = 1
    }
  }

  context.putImageData(imagedata, 0, 0,)

}

export function renderDarkColors(pctx: IPainterContext) {
  const { u, xs, ys } = pctx;

  const anchors = [];

  const count = u.rnd(2,9);
  for (let index = 0; index < count; ++index) {
    anchors.push({
      x: u.rnd(xs),
      y: u.rnd(ys),
      r: u.rnd(255),
      g: u.rnd(255),
      b: u.rnd(255),
    });
  }

  const minD = Math.max(xs,ys)/2; //Math.min(...anchors.slice(0, count-1).map((a,i) => Math.min(...anchors.slice(i+1).map(b => distance(a,b)))));

  const color = (x,y) => {
    const p = {x,y};

    let r = 0, g = 0, b = 0;

    anchors.forEach(a => {
      const d = distance(a, p);
      const f = Math.max(1 - d/minD, 0) / count * 2;
      r += a.r*f;
      g += a.g*f;
      b += a.b*f;
    });

    return [r,g,b] 
  }

  renderPixelColors(pctx, color);
}

export function renderLightColors(pctx: IPainterContext) {
  const { u, xs, ys } = pctx;

  const anchors = [];

  const count = u.rnd(2,9);
  for (let index = 0; index < count; ++index) {
    anchors.push({
      x: u.rnd(xs),
      y: u.rnd(ys),
      r: u.rnd(255),
      g: u.rnd(255),
      b: u.rnd(255),
    });
  }

  const minD = Math.max(xs,ys)/2; //Math.min(...anchors.slice(0, count-1).map((a,i) => Math.min(...anchors.slice(i+1).map(b => distance(a,b)))));

  const color = (x,y) => {
    const p = {x,y};

    let r = 255, g = 255, b = 255;

    anchors.forEach(a => {
      const d = distance(a, p);
      const f = Math.max(1 - d/minD, 0) / count * 2;
      r -= a.r*f;
      g -= a.g*f;
      b -= a.b*f;
    });

    return [r,g,b] 
  }


  renderPixelColors(pctx, color);
}


export function renderMixedColors(pctx: IPainterContext) {
  const { u, xs, ys } = pctx;

  const anchors = [];

  const count = u.rnd(2,9);
  for (let index = 0; index < count; ++index) {
    anchors.push({
      x: u.rnd(xs),
      y: u.rnd(ys),
      r: u.rnd(255),
      g: u.rnd(255),
      b: u.rnd(255),
    });
  }

  const color = (x,y) => {
    const p = {x,y};

    let closest = [];
    anchors.forEach(a => {
      const d = distance(a, p);

      if (closest.length === 0) {
        closest.push({ ...a, d });
      } else {
        for (var i = 0, n = Math.min(3, closest.length); i < n; ++i) {
          if (d <= closest[i].d) {
            closest.splice(i, 0,  { ...a, d });
            closest = closest.slice(0, 3);
          }
        }
        }
    });

    const distances = closest.map(x => x.d);
    const maxD = Math.max(...distances);
    const minD = Math.min(...distances);
    const sumD = distances.reduce((a,b) => a+b, 0);

    let [r, g, b] = [0,0,0];
    
    closest.forEach(a  => {
      const f = Math.max(1 - (a.d / sumD), 0);
      r += f * a.r;
      g += f * a.g;
      b += f * a.b;
    });

    return [r,g,b] 
  }


  renderPixelColors(pctx, color);
}