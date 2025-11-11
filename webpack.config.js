
import path from 'node:path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

//const path = require('path');
//const HtmlWebpackPlugin = require('html-webpack-plugin');
//const { CleanWebpackPlugin } = require('clean-webpack-plugin');

let config = () => {

  return ({
    entry: {
      browser: path.resolve('./src/browser.ts')
    },
    mode: 'production',
    optimization: {
      usedExports: true
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ],
      extensionAlias: {
        '.js': ['.ts', '.js'],
        '.mjs': ['.mts', '.mjs'],
      }
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        title: 'Lorem Icon',
        template: 'src/browser.html',
        filename: 'browser.html',
        chunks: 'browser'
      }),
    ],
    output: {
      filename: 'bundle.js',
      path: path.resolve(import.meta.dirname, 'dist'),
    },
  });

};

export default config;