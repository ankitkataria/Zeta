const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
  entry: {
    app: './app/scripts/index.js',
    chat: './app/scripts/chat.js',
    cryptoWorker: './app/scripts/crypto-worker.js'
  },
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name].js'
  },
  plugins: [
    // Copy our app's index.html to the build folder.
    new CopyWebpackPlugin([
      { from: './app/index.html', to: 'index.html' },
      { from: './app/chat.html', to: 'chat.html' },
      { from: './app/scripts/renderer.js', to: 'scripts/renderer.js' },
      { from: './app/scripts/main.js', to: 'scripts/main.js' },
      { from: './app/styles/app.css', to: 'styles/app.css' },
      { from: './app/styles/chat.css', to: 'styles/chat.css' },
    ])
  ],
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      { test: /\.s?css$/, use: [ 'style-loader', 'css-loader', 'sass-loader' ] },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['env'],
          plugins: ['transform-react-jsx', 'transform-object-rest-spread', 'transform-runtime']
        }
      }
    ]
  }
}

