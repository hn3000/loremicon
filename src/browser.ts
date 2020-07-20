
import { renderGradient, renderNGon, renderPixels, renderPoly, renderRect, renderLightColors, renderDarkColors, renderMixedColors, IPainterContext } from './painters';
import { Util } from './util';

function imageBlock(path, seed) {
  const url = new URL(path, location.href);
  const img = document.createElement('img');
  const holder = document.createElement('div');
  const linkHolder = document.createElement('div');
  const link = document.createElement('a');
  holder.appendChild(img);
  holder.appendChild(linkHolder);
  linkHolder.appendChild(link);
  holder.classList.add('image');
  const baseUrl = new URL('/', url);
  const baseLength = baseUrl.toString().length;
  link.appendChild(document.createTextNode(url.toString().substr(baseLength - 1)));
  link.href = url.toString();
  if (0 === +seed) {
    fetch(url.toString()).then(res => { 
      const u = res.url.toString();

      console.log(`fetch ${url} returned ${u}`);

      img.setAttribute('src', u);

      link.href = u.toString();
      link.appendChild(document.createTextNode(u.toString().substr(baseLength - 1)));
      link.firstChild.remove();
    });
  } else {
    img.setAttribute('src', url.toString());
  }

  return holder;
}

function canvasBlock(path) {
  const url = new URL(path, location.href);
  const img = document.createElement('canvas');
  const holder = document.createElement('div');
  const linkHolder = document.createElement('div');
  const link = document.createElement('a');
  holder.appendChild(img);
  holder.appendChild(linkHolder);
  linkHolder.appendChild(link);
  holder.classList.add('image');
  const baseUrl = new URL('/', url);
  const baseLength = baseUrl.toString().length;
  link.appendChild(document.createTextNode(url.toString().substr(baseLength - 1)));
  link.href = url.toString();
  img.setAttribute('src', url.toString());
  const parts = path.split('/');
  img.setAttribute('data-kind', parts[1]);
  img.setAttribute('data-seed', parts[4]);
  img.setAttribute('width', parts[2]);
  img.setAttribute('height', parts[3]);
  img.setAttribute('data-width', parts[2]);
  img.setAttribute('data-height', parts[3]);
  img.setAttribute('data-todo', 'still');

  return holder;
}

const RENDERERS = {
  rect: renderRect,
  grad: renderGradient,
  poly: renderPoly,
  ngon: renderNGon,
  pxls: renderPixels,
  lclr: renderLightColors,
  dclr: renderDarkColors,
  mclr: renderMixedColors,
}

function renderNext() {
  const next = document.querySelector('canvas[data-todo=still]') as HTMLCanvasElement;

  if (next == null) return;

  setTimeout(renderNext, 0);

  next.setAttribute('data-todo', 'done');
  const dataset = (next as any).dataset;
  const kind = dataset.kind;
  const seed = dataset.seed;
  const width = dataset.width;
  const height = dataset.height;

  const pctx: IPainterContext = {
    context: next.getContext('2d'),
    u: new Util(+seed),
    xs: +width,
    ys: +height
  };

  const render = RENDERERS[kind];
  render(pctx);
}

const defaultStyles = Object.keys(RENDERERS);

export function createImages(imageHolder: HTMLElement, count: number = 10, styles = defaultStyles) {
  imageHolder.innerHTML = '';
  let seed = Math.round(Math.random()*1e12);
  for (var i = 0; i < count; ++i) {
    for (var j = 0; j < styles.length; ++j) {
      let ib = canvasBlock(`/${styles[j]}/128/128/${seed}/jpg`);
      imageHolder.append(ib);
    }
    ++seed;
  }
  renderNext()
}


createImages(document.querySelector('#images'));