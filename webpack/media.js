function fileLoader(
  {
    pattern,
    issuerPattern,
    hashNames = false,
  } = {}
) {
  const nameTemplate = (hashNames ? '[hash]' : '[name]') + '.[ext]';
  const rule = {
    test: pattern,
    loader: 'file-loader',
    options: {
      name: nameTemplate,
    },
  };
  if (issuerPattern) rule.issuer = issuerPattern;
  return rule;
}

module.exports = {
  loaders: {
    fonts() {
      return [
        fileLoader({
          pattern: /\.(eot|svg|otf|ttf|woff|woff2)$/,
          issuerPattern: /\.css$/,
          hashNames: true,
        }),
      ];
    },

    images() {
      return [
        fileLoader({
          pattern: /\.(png|jpg|jpeg|gif)$/,
          hashNames: true,
        }),
        fileLoader({ pattern: /favicon\.ico$/ }),
        {
          test: /\.svg$/,
          issuer: /\.jsx?$/,
          loader: 'svg-react-loader',
        },
      ];
    }
  },
};
