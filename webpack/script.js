const {
  ProvidePlugin,
  EnvironmentPlugin,
} = require('webpack');
const { UglifyJsPlugin } = require('webpack').optimize;
const PrepackWebpackPlugin = require('prepack-webpack-plugin').default;
const renamejsxprops = require('../babel-plugin-keep-web-simple-yet-modern');

module.exports = {
  loaders({ src, magicSrc, browsers, optimize = false }) {
    const babelOptions = {
      presets: [
        [
          'env',
          {
            targets: { browsers },
            modules: false,
            useBuiltIns: 'entry',
            debug: true,
          },
        ],
        'react',
      ],
      plugins: [
        'transform-class-properties',
        [
          renamejsxprops, {
          ['class']: 'className',
          autofocus: 'autoFocus',
          ['for']: 'htmlFor',
          colspan: 'colSpan',
          tabindex: 'tabIndex',
          onready: 'onComponentDidMount',
        },
        ],
        'jsx-control-statements',
        ...(
          true ? [
            'transform-react-constant-elements',
            'transform-react-inline-elements',
            'transform-react-remove-prop-types',
            'transform-react-pure-class-to-function',
          ] : []
        ),
      ].filter(p => Boolean(p)),
    };
    return [
      {
        test: /\.jsx?$/,
        include: [src, magicSrc],
        use: [
          {
            loader: 'babel-loader',
            options: babelOptions,
          },
        ],
      },
    ];
  },

  plugins({ optimize, env, globals = {} }) {
    const basePlugins = [
      new EnvironmentPlugin(env),
      new ProvidePlugin(
        Object.assign(
          {
            React: 'react', // Babel JSX pragma defaults to React.createElement
            classNames: 'classnames',
          },
          globals,
        ),
      ),
    ];

    if ( !optimize ) return basePlugins;
    return [
      ...basePlugins,
      // ref: https://prepack.io/getting-started.html#options
      new PrepackWebpackPlugin({}),
      new UglifyJsPlugin({
        compress: {
          warnings: false,
          screw_ie8: true,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
        },
        output: {
          comments: false,
        },
      }),
    ];
  },
};
