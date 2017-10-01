const path = require('path');
const { ModuleConcatenationPlugin } = require('webpack').optimize;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const fragments = require('./index');

const MAGIC_SRC = path.resolve(__dirname);
const PROJECT_DIR = process.cwd();

const {
  NODE_ENV = 'development',
  BROWSERS,
  CSS_FUCS
} = process.env;
const SRC_DIR = path.resolve(PROJECT_DIR, process.env.SRC_DIR);
const cssFunctions = require(path.resolve(PROJECT_DIR, CSS_FUCS));
const browsers = require(path.resolve(PROJECT_DIR, BROWSERS));
const BUILD_DIR = path.resolve(PROJECT_DIR, 'dist');
const NODE_MODULES_DIR = path.resolve(PROJECT_DIR, 'node_modules');

const PRODUCTION = NODE_ENV === 'production';
const DEV = NODE_ENV === 'development';

module.exports = {
  entry: fragments.io.input({ src: path.resolve(__dirname, './entry.js') }),
  output: fragments.io.output({
    path: BUILD_DIR,
  }),
  devtool: PRODUCTION ? 'source-map' : 'cheap-module-eval-source-map',

  resolve: fragments.io.resolve({ src: SRC_DIR }),
  module: {
    rules: [
      ...fragments.script.loaders({
        src: SRC_DIR,
        magicSrc: MAGIC_SRC,
        optimize: PRODUCTION,
        browsers,
      }),
      ...fragments.style.loaders({
        src: SRC_DIR,
        functions: cssFunctions,
        generateFile: PRODUCTION,
        browsers,
      }),
      ...fragments.media.loaders.fonts(),
      ...fragments.media.loaders.images(),
    ],
  },
  plugins: [
    new ModuleConcatenationPlugin(),
    new HtmlWebpackPlugin({
      minify: PRODUCTION,
      template: path.resolve(SRC_DIR, 'meta.html'),
    }),
    ...fragments.script.plugins({
      optimize: PRODUCTION,
      env: { NODE_ENV, MAIN_FILE: SRC_DIR},
    }),
    ...fragments.style.plugins({
      optimize: PRODUCTION,
      generateFile: PRODUCTION,
    }),
  ],
};
