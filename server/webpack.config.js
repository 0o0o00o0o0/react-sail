'use strict';

const path = require('path');
const fs = require('fs');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const _externals = require('externals-dependencies')

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  // Don't attempt to continue if there are any errors.
  bail: true,
  devtool: 'source-map',
  entry: resolveApp('server/src/index.ts'),
  output: {
    path: resolveApp('server/build'),
    filename: 'index.js',
    chunkFilename: '[name].[chunkhash:8].chunk.js',
    publicPath: '/'
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json", ".css"],
    plugins: [
      new TsconfigPathsPlugin({ configFile: resolveApp('server/tsconfig.json') })
    ]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|mjs)$/,
        loader: require.resolve('source-map-loader'),
        enforce: 'pre'
      },
      {
        oneOf: [
          // {
          //   test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
          //   loader: require.resolve('url-loader'),
          //   options: {
          //     limit: 10000,
          //     name: 'static/media/[name].[hash:8].[ext]',
          //   },
          // },
          // Compile .tsx?
          {
            test: /\.(ts|tsx)$/,
            exclude: /node_modulss/,
            // include: paths.appSrc,
            use: [
              {
                loader: 'awesome-typescript-loader',
                options: {
                  // disable type checker - we will use it in fork plugin
                  transpileOnly: true
                }
              }
            ]
          },
          {
            test: /\.less$/,
            exclude: /node_modules|antd\.less/,
            loader: ExtractTextPlugin.extract(
              {
                use: [
                  {
                    loader: 'css-loader/locals',
                    options: {
                      importLoaders: 1,
                      minimize: true,
                      sourceMap: true,
                      modules: true,
                      localIdentName: '[local]___[hash:base64:5]'
                    },
                  }
                ]
              }
            )
          },
          // {
          //   test: /\.css$/,
          //   use: [
          //     require.resolve('style-loader'),
          //     {
          //       loader: require.resolve('css-loader'),
          //       options: {
          //         importLoaders: 1,
          //       },
          //     },
          //     {
          //       loader: require.resolve('postcss-loader'),
          //       options: {
          //         // Necessary for external CSS imports to work
          //         // https://github.com/facebookincubator/create-react-app/issues/2677
          //         ident: 'postcss',
          //         plugins: () => [
          //           require('postcss-flexbugs-fixes'),
          //           autoprefixer({
          //             browsers: [
          //               '>1%',
          //               'last 4 versions',
          //               'Firefox ESR',
          //               'not ie < 9', // React doesn't support IE8 anyway
          //             ],
          //             flexbox: 'no-2009',
          //           }),
          //         ],
          //       },
          //     },
          //   ],
          // },
          // "file" loader makes sure those assets get served by WebpackDevServer.
          // When you `import` an asset, you get its (virtual) filename.
          // In production, they would get copied to the `build` folder.
          // This loader doesn't use a "test" so it will catch all modules
          // that fall through the other loaders.
          // {
          //   // Exclude `js` files to keep "css" loader working as it injects
          //   // it's runtime that would otherwise processed through "file" loader.
          //   // Also exclude `html` and `json` extensions so they get processed
          //   // by webpacks internal loaders.
          //   exclude: [/\.js$/, /\.html$/, /\.json$/],
          //   loader: require.resolve('file-loader'),
          //   options: {
          //     name: 'static/media/[name].[hash:8].[ext]',
          //   },
          // },
        ]
      }
      // ** STOP ** Are you adding a new loader?
      // Make sure to add the new loader(s) before the "file" loader.
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'server.css',
      ignoreOrder: true
    })
  ],
  target: 'node',
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
    __dirname: true,
    __filename: true
  },
  // externals: {
  //   "react": "React",
  //   "react-dom": "ReactDOM"
  // }
  externals: _externals()
}