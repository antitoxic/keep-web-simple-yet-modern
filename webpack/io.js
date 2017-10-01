const DirectoryNamedWebpackPlugin = require('directory-named-webpack-plugin');

module.exports = {
  input({ src }) {
    return {
      app: src,
    };
  },

  output({ path, url = '/'}) {
    return {
      path,
      publicPath: url,
      filename: '[name].js?[chunkhash]',
      chunkFilename:'[name].chunk.js?[chunkhash]',
    };
  },

  resolve({ src, aliases }) {
    return {
      extensions: ['.js', '.jsx',],
      modules: ['node_modules', src ],
      plugins: [
        new DirectoryNamedWebpackPlugin({
          include: [src],
          transformFn(_dirName) {
            return ['template'];
          },
        }),
      ],
      alias: Object.assign(
        {
        },
        aliases
      ),
    };
  }
};
