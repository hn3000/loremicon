
const base = require('./webpack.config');
const path = require('path');

module.exports = () => {
  const config = base();

  config.mode = 'development';
  config.devtool = 'inline-source-map';
  config.devServer = {
    static: path.resolve(__dirname, 'dist'),
  };

  console.log('webpack dev config', config);
  return config;
};
