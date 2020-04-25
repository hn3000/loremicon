import * as c from 'canvas';
import * as express from 'express';
import * as path from 'path';

import { renderPixels, renderPoly, renderRect, renderGradient, renderNGon } from './painters';
import { UnitFactorsDefault, dimension, dimensionProxy } from './dimension';
import { box, position } from './position';
import { Util } from './util';

function runServer(argv) {
  console.log("starting express");
  let app = express();

  app.use(express.json());

  app.get("/", function(req, res) {
    res.sendFile("index.html", { root: path.resolve(__dirname, '../assets') });
  });
  app.get("/help-me/example/:json", function(req, res) {
    //console.log(`GET ${req.params.json}`);
    res.sendFile(req.params.json, { root: path.resolve(__dirname, '../example') });
  });
  app.get("/help-me", function(req, res) {
    if (req.originalUrl.endsWith('/')) {
      res.sendFile("form.html", { root: path.resolve(__dirname, '../assets') });
    } else {
      res.setHeader('Location', '/help-me/');
      res.sendStatus(301);
    }
  });

  const styles = {
    grad: renderGradient,
    pxls: renderPixels,
    poly: renderPoly,
    ngon: renderNGon,
    rect: renderRect,
  };
  const formats = {
    pdf: [writePDF, 'pdf'],
    svg: [writeSVG, 'svg'],
    png: [writePNG, 'image'],
    jpg: [writeJPEG, 'image'],
    jpeg: [writeJPEG, 'image'],
    data: [writeDATA, 'image'],
    datapng: [writeDATAPNG, 'image'],
    datajpeg: [writeDATAJPEG, 'image']
  };

  app.get("/favicon.ico", function handleFavicon(req, res) {
    res.redirect(`/rect/64/64/35863/png`);
  });
  app.get("/:x/:y", function handleXY(req, res) {
    const { x,y } = req.params;
    const seed = Math.ceil(Math.random()*1e8);
    res.setHeader('cache-control', 'no-cache');
    res.redirect(`/poly/${x}/${y}/${seed}/png`);
  });
  app.get("/:style/:x/:y/", function handleStyleXY(req, res) {
    const { style, x,y, format } = req.params;
    const seed = Math.ceil(Math.random()*1e8);
    res.setHeader('cache-control', 'no-cache');
    res.redirect(`/${style}/${x}/${y}/${seed}/png`);
  });
  app.get("/:style/:x/:y/:format", function handleStyleXYFormat(req, res) {
    const { style, x,y, format } = req.params;
    const seed = Math.ceil(Math.random()*1e8);
    res.setHeader('cache-control', 'no-cache');
    res.redirect(`/${style}/${x}/${y}/${seed}/${format}`);
  });

  app.get("/:style/:x/:y/:seed/:format",  function handleStyleXYSeedFormat(req, res) {
    
    const styleFun = styles[req.params.style];
    const fmtq = (req.params.format  || 'jpg,0.3').split(',');
    const fmt = fmtq[0];
    const q = fmtq[1] || 0.3;
    const format = formats[fmt];

    if (styleFun && format) {
      createImage(styleFun, format, req, res, q);
    } else {
      res.sendStatus(404);
      console.log("not found: ", req.path, req.params);
    }
  });

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
}

const { WATERMARK=false} = process.env;

/** @param res: express.Request */
function createImage(painter, [writer, type], req, res, q) {
  const start = Date.now();
  //console.log(req.path, req.params, req.body);
  const { x, y, seed } = req.params;

  let { width, height } = dimensionProxy(req.body || {}, { width: x, height: y });
  const w = width.value();
  const h = height.value();
  const area = w * h;
  if (w < 0 || h < 0 || area > 3e6) {
    res.sendStatus(400, `illegal size`);
  } else {
    let xs = width.value();
    let ys = height.value();
    let canvas = new c.Canvas(xs, ys, type);
    const context = canvas.getContext('2d');
    context.save();

    const u = new Util(seed);
    const env0 = { 
      vh: height.value()/100, 
      vw: width.value() / 100, 
      vmin: Math.min(height.value(), width.value()) / 100, 
      vmax: Math.max(height.value(), width.value()) / 100,
      ...UnitFactorsDefault,
      seed: (u as any)._seed
    };

  
    painter({ context, u, xs: x, ys: y });

    const watermark = WATERMARK;
    maybeRenderWatermark(req, canvas, watermark, width, height, env0);

    writer(canvas, res, q);
  }
  res.on('close', () => {
    console.log(`generated ${req.url} in ${Date.now() - start}ms`);
  });
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


const cluster = require('cluster');
const numCPUs = +process.env['CPU_COUNT'] || require('os').cpus().length;

if (numCPUs == 1) {
  runServer(process.argv);
} else {
  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is starting ${numCPUs} worker${numCPUs == 1 ? '' : 's'}`);
  
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
