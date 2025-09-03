const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: path.relative(__dirname, 'index.js'),
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'build'),
    clean: true
  },
  resolve: {
    extensions: ['.js', '.ts'],
    modules: ['node_modules', path.join(__dirname, '.')]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  externals: [nodeExternals()]
};