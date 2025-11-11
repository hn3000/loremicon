import { PAINTERS } from './painters.js';
import { unitFactors, dimensionProxy } from './dimension.js';
import { box, position } from './position.js';
import { Util } from './util.js';

import * as c from 'canvas';
import express, { Request, Response } from 'express';
import * as path from 'path';

function runServer(argv) {
  console.log("starting express");
  let app = express();

  app.use(express.json());

  app.use((rq,rs, next) => {
    rq.props = {};
    next();
  });

  app.get("/", function(req, res) {
    res.sendFile("index.html", { root: path.resolve(import.meta.dirname, '../assets') });
  });
  app.get("/b{/:file}", function(req, res) {
    if (req.url === '/b') {
      res.redirect('/b/');
    }
    const { file='browser.html' } = req.params;
    res.sendFile(file, { root: path.resolve(import.meta.dirname, '../dist') });
  });
  app.get("/help-me/example/:json", function(req, res) {
    //console.log(`GET ${req.params.json}`);
    res.sendFile(req.params.json, { root: path.resolve(import.meta.dirname, '../example') });
  });
  app.get("/help-me", function(req, res) {
    if (req.originalUrl.endsWith('/')) {
      res.sendFile("form.html", { root: path.resolve(import.meta.dirname, '../assets') });
    } else {
      res.setHeader('Location', '/help-me/');
      res.sendStatus(301);
    }
  });

  const styles = {
    ...PAINTERS,
    rndm: renderRandom,
    drnd: renderDeterministicRandom,
  };
  const formats = {
    pdf: [writePDF, 'pdf'],
    svg: [writeSVG, 'svg'],
    png: [writePNG, 'image'],
    jpg: [writeJPEG, 'image'],
    jpeg: [writeJPEG, 'image'],
    data: [writeDATA, 'image'],
    datapng: [writeDATAPNG, 'image'],
    datajpeg: [writeDATAJPEG, 'image'],
    hexpng: [writeHexPNG, 'image'],
    urlpdf: [writeUrl, 'url'],
    urlsvg: [writeUrl, 'url'],
    urlpng: [writeUrl, 'url'],
    urljpg: [writeUrl, 'url'],
    urljpeg: [writeUrl, 'url'],
  };

  app.get("/favicon.ico", function handleFavicon(req, res) {
    res.redirect(`/rect/64/64/35863/png`);
    res.end();
  });
  app.get("/:x/:y", function handleXY(req, res) {
    const { x,y } = req.params;
    const seed = Math.ceil(Math.random()*1e8);
    res.setHeader('cache-control', 'no-cache');
    res.redirect(`/poly/${x}/${y}/${seed}/png`);
  });
  app.get("/:a/:b/:c/", function handleStyleXY(req, res) {
    const { a, b, c } = req.params;
    const seed = Math.ceil(Math.random()*1e8);
    res.setHeader('cache-control', 'no-cache');

    if (Number.parseInt(a) && c in formats) {
      const [ x, y, format ] = [a,b,c];
      res.redirect(`/drnd/${x}/${y}/${seed}/${format}`);
    } else {
      const [ style, x, y ] = [a,b,c];
      res.redirect(`/${style}/${x}/${y}/${seed}/png`);
    } 

  });
  app.get("/:style/:x/:y/:format", function handleStyleXYFormat(req, res) {
    const { style, x,y, format } = req.params;
    const seed = Math.ceil(Math.random()*1e8);
    res.setHeader('cache-control', 'no-cache');
    res.redirect(`/${style}/${x}/${y}/${seed}/${format}`);
  });

  app.get("/:style/:x/:y/:seed/:format", handleStyleXYSeedFormat);
  app.get("/:style/:x/:y/:seed/:extra1/:format",  handleStyleXYSeedFormat);
  app.get("/:style/:x/:y/:seed/:extra1/:extra2/:format",  handleStyleXYSeedFormat);
  app.get("/:style/:x/:y/:seed/:extra1/:extra2/:extra3/:format",  handleStyleXYSeedFormat);

  function handleStyleXYSeedFormat(req: Request, res: Response) {
    const { extra1, extra2, extra3 } = req.params;

    const extraParams = {} as { [key:string]: string|string[]};
    const extra = [extra1,extra2,extra3].filter(x => null != x && x !== '');
    for (let e of extra) {
      if (-1 != e.indexOf('=')) {
        let [k,v] = e.split('=');
        if (-1 !== v.indexOf(';')) {
          extraParams[k] = v.split(';');
        } else if (-1 !== v.indexOf(',')) {
          extraParams[k] = v.split(',').map(x => `#${x}`);
        } else {
          try {
            extraParams[k] = JSON.parse(v);
          } catch {
            extraParams[k] = v;
          }
        }
      }
    }
    if (Object.keys(extraParams).length) {
      console.log('found extra params', extraParams);
    }
    
    const styleFun = styles[req.params.style];
    const fmtq = (req.params.format  || 'jpg,0.3').split(',');
    const fmt = fmtq[0];
    const q = Number.parseFloat(fmtq[1]) || 0.3;
    const format = formats[fmt];

    if (styleFun && format) {
      createImage(styleFun, format, req, res, q, extraParams);
    } else {
      res.sendStatus(404);
      console.log("not found: ", req.path, req.params);
    }
  }

  let { HOST = "::0", PORT = 3478 } = process.env;
  let r = app.listen(+PORT, HOST);

  r.once("listening", function() {
    const a = r.address();
    console.log("address: ", a);
    if (typeof a === 'string') {
      console.log(
        `listening, address: ${a}`
      );
    } else {
      let port = a.port;
      let host = a.address;
      console.log(
        `listening, try http://localhost:${port}/help-me/ or http://${host}:${port}/help-me/`
      );
    }
  });

  function renderRandom(context, req, res) {
    const all = Object.keys(PAINTERS);
    const chosen = all[Math.floor(Math.random()*all.length) % all.length];

    const newUrl = req.originalUrl.replace('/rndm/', `/${chosen}/`);
    res.redirect(newUrl);
    res.end();

    return 'no-output';
  }
  function renderDeterministicRandom(context, req, res) {
    const all = Object.keys(PAINTERS);
    const { seed } = req.params;
    const util = new Util(seed);
    const chosen = all[util.rnd(all.length-1)];

    const newUrl = req.originalUrl.replace('/drnd/', `/${chosen}/`);
    res.redirect(newUrl);
    res.end();

    return 'no-output';
  }
}

const { WATERMARK=false} = process.env;

function createImage(painter, [writer, type], req: express.Request, res: express.Response, q: number, extraParams) {
  const start = Date.now();
  try {
    //console.log(req.path, req.params, req.body);
    const { x, y, seed, format } = req.params;

    let { width, height } = dimensionProxy(req.body || {}, { width: x, height: y }, unitFactors.bind(null, format));
    const w = width.value();
    const h = height.value();
    const area = w * h;
    if (w < 0 || h < 0 || area > 3e6) {
      res.sendStatus(400);
    } else {
      let xs = width.value();
      let ys = height.value();
      let canvas = new c.Canvas(xs, ys, type != 'url' ? type : 'image');
      const context = canvas.getContext('2d');
      context.save();

      let { colors, palette } = extraParams;
      let utilOptions = { colors, palette };
  
      const u = new Util(+seed, utilOptions);
      const env0 = { 
        vh: height.value() / 100, 
        vw: width.value() / 100, 
        vmin: Math.min(height.value(), width.value()) / 100, 
        vmax: Math.max(height.value(), width.value()) / 100,
        ...unitFactors(format),
        seed: (u as any)._seed
      };
      req.props['format'] = type;
      req.props['url'] = `${req.protocol}://${req.get('Host')}${req.originalUrl}`;

      const painted = painter({ context, u, xs: w, ys: h }, req, res);
      if (painted !== 'no-output') {
        const watermark = extraParams?.watermark ?? WATERMARK;
        maybeRenderWatermark(req, canvas, watermark, width, height, env0);
    
        writer(canvas, res, q);
      }
    }
    res.on('close', () => {
      console.log(`generated ${req.url} in ${Date.now() - start}ms`);
    });
  } catch (ex) {
    console.log(`error for ${req.url} after ${Date.now() - start}ms`, ex);
  }

}

function maybeRenderWatermark(req, canvas, watermark, width, height, env0) {
  if (WATERMARK || watermark) {
    const ctx = canvas.getContext('2d');
    let i = 0;
    try {
      for (i = 0; i < 100; ++i) {
        ctx.restore();
      }
    } catch(e) {
      console.log(`exception trying to restore (${i})`, e);
    }
    ctx.resetTransform();
    
    const defConfig = { 
      fontSize: '3vmin'
    };
    let wmConfig = defConfig as any;
    if (typeof watermark === 'object') {
      wmConfig = watermark;
    }
    const config = dimensionProxy(wmConfig, defConfig, () => env0);

    const { fontSize } = config;
    const { 
      fontFamily = 'Courier,fixed', 
      fillStyle = (typeof watermark === 'string') ? watermark : '#678'
    } = wmConfig;
    
    ctx.fillStyle = fillStyle;
    const font =  `${fontSize.value()}px ${fontFamily}`;
    //console.log(font);
    ctx.font = font;
    const url = `${req.protocol}://${req.get('Host')}${req.originalUrl}#${env0.seed}`;

    const env1 = { ...env0, em: fontSize.value() };
    const wmbox = box(position(0,0), position(width, height)).resolve(env1).insideBox('1em');
    const pos = wmbox.bottomLeft();
    //console.log('bottom left', pos.x(), pos.y(), dimension('1em').value(env1));
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(url, pos.x(), pos.y(), wmbox.width());
    console.log('rendered watermark', watermark);
  } else {
    console.log('skipped watermark', watermark, WATERMARK);
  }
}

function writePNG(canvas, res) {
  let stream = canvas.createPNGStream();
  res.type("png");
  stream.pipe(
    res,
    { end: true }
  );
}

function writeJPEG(canvas: c.Canvas, res) {
  let stream = canvas.createJPEGStream();
  res.type("jpeg");
  stream.pipe(
    res,
    { end: true }
  );
}

function writePDF(canvas: c.Canvas, res) {
  let stream = canvas.createPDFStream();
  res.type("pdf");
  stream.pipe(
    res,
    { end: true }
  );
}

function writeSVG(canvas: c.Canvas, res) {
  let buffer = canvas.toBuffer();
  res.type("svg");

  //console.log(buffer.toString());
  res.send(buffer);
}

function writeDATA(canvas: c.Canvas, res) {
  let dataUrl1 = canvas.toDataURL('image/png');
  let dataUrl2 = canvas.toDataURL('image/jpeg', 0.4);
  let dataUrl = dataUrl1.length < dataUrl2.length ? dataUrl1 : dataUrl2;
  res.redirect(dataUrl);
}

function writeDATAPNG(canvas: c.Canvas, res) {
  let dataUrl = canvas.toDataURL('image/png');
  res.redirect(dataUrl);
}

function writeDATAJPEG(canvas: c.Canvas, res, q=0.3) {
  let dataUrl = canvas.toDataURL('image/jpeg', q);
  res.redirect(dataUrl);
}

const hexDigits = '0123456789abcdef';
function toHex(x: number) {
  return hexDigits[(x >>> 4) & 0xf] + hexDigits[x & 0xf];
}

function writeHexPNG(canvas: c.Canvas, res) {
  //let dataUrl = canvas.toDataURL('image/png');
  let buffer = canvas.toBuffer();
  let hexBuffer = []
  buffer.forEach(x => hexBuffer.push(toHex(x)));
  res.type('text/plain');
  res.send(hexBuffer.join(''));
}

function writeUrl(canvas: c.Canvas, res: Response) {
  //let dataUrl = canvas.toDataURL('image/png');
  //let buffer = canvas.toBuffer();
  //let hexBuffer = []
  //buffer.forEach(x => hexBuffer.push(toHex(x)));
  res.type('text/plain');
  //res.send(res.get('Location').replace('url', ''));
  res.send(res.req.props['url'].replace('url', ''));
  //res.send(hexBuffer.join(''));
}


import cluster from 'node:cluster';
import * as os from 'node:os';
import { ServerResponse } from 'node:http';
const numCPUs = +process.env['CPU_COUNT'] || os.cpus().length;

if (numCPUs == 1) {
  console.log('running with one CPU, only');
  runServer(process.argv);
} else {
  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is starting ${numCPUs} worker${numCPUs == 1 ? '' : 's'}`);
  
    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  
    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    runServer(process.argv);
  }
}
