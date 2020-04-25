import { Util } from "./util";

export interface IPainterContext {
  context: CanvasRenderingContext2D;
  u: Util;
  xs: number;
  ys: number;
}
export interface Painter {
  (ctx: IPainterContext): void;
}

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
