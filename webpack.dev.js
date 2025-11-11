
//const base = require('./webpack.config');
//const path = require('path');
import base from './webpack.config.js';
import path from 'node:path';

let config = () => {
  const config = base();

  config.mode = 'development';
  config.devtool = 'inline-source-map';
  config.devServer = {
    static: path.resolve(import.meta.dirname, 'dist'),
  };

  console.log('webpack dev config', config);
  return config;
};

export default config;
