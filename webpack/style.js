const postcssImport = require('postcss-import');
const autoprefixer = require('autoprefixer');
const postcssAdvancedVariables = require('postcss-advanced-variables');
const postcssCalc = require('postcss-calc');
const postcssFocus = require('postcss-focus');
const postcssFunctions = require('postcss-functions');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

// translates CSS into JSON which keys are the classnames
function css(cssModules = false) {
  return {
    // ref:
    // http://zinserjan.github.io/mocha-webpack/docs/installation/webpack-configuration.html
    loader: 'css-loader',
    options: {
      modules: cssModules,
      minimize: false,
      localIdentName: '[local]__[hash:base64:5]',
      sourceMap: true,
    },
  };
}

// imports, variables, functions and optimizations
function postcss({ root, browsers, onlyOptimize = false, functions = []}) {
  const plugins = [
    !onlyOptimize && postcssImport({
      path: [root],
    }),
    autoprefixer({ browsers }),
    !onlyOptimize && postcssAdvancedVariables,
    postcssFocus,
    !onlyOptimize && postcssFunctions({
      functions,
    }),
    postcssCalc,
  ].filter(p => Boolean(p));
  return {
    loader: 'postcss-loader',
    options: {
      plugins: () => plugins,
      sourceMap: true,
    },
  };
}

function createStyleLoader({
                             pattern,
                             cssModules,
                             extraLoaders = [],
                             generateFile,
                             include,
                             exclude,
                           }) {
  let loaders = [];
  loaders.push('style-loader');
  loaders.push(css(cssModules));
  loaders = loaders.concat(extraLoaders);

  const rule = {
    test: pattern,
    use: generateFile
      ? ExtractTextPlugin.extract({
        fallback: loaders.shift(),
        use: loaders,
      })
      : loaders,
  };
  if ( include ) rule.include = include;
  if ( exclude ) rule.exclude = exclude;
  return rule;
}

module.exports = {
  loaders({ src, browsers, generateFile = false, functions = [] }) {
    const projectSpecificConfig = {
      onlyOptimize: false,
      loader: { include: src, cssModules: true },
    };
    const vendorConfig = {
      onlyOptimize: true,
      loader: { exclude: src, cssModules: false },
    };
    return [projectSpecificConfig, vendorConfig].map(cfg => {
      return createStyleLoader(
        Object.assign(
          {
            pattern: /\.css$/,
            extraLoaders: [
              postcss({
                root: src,
                onlyOptimize: cfg.onlyOptimize,
                functions,
                browsers,
              }),
            ],
            generateFile,
          },
          cfg.loader,
        ),
      );
    });
  },

  plugins({ generateFile, optimize = false, } = {}) {
    return [
      generateFile && new ExtractTextPlugin({
        filename: '[name].css?[contenthash]',
      }),
      optimize && new OptimizeCssAssetsPlugin({
        cssProcessorOptions: { discardComments: { removeAll: true } },
      }),
    ].filter(p => Boolean(p));
  },
};
