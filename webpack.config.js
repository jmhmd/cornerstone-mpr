const path = require('path');

module.exports = {
  entry: {
    main: './src/index.ts',
    // threetest: './test/threetest.js',
    // calipers: './test/calipers-test.js'
  },
  mode: 'development',
  devtool: 'source-map',
  target: 'web',
  // node: {
  //   console: true,
  //   // __dirname: true,
  // },
  context: __dirname,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              // transpileOnly: true,
              // experimentalWatchApi: true,
            }
          }
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
};
