const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
      app: './src/index.jsx'
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'public')
    },
    devServer: {
      contentBase: './public',
      hot: true
    },
    resolve: {
      extensions: ['.js', '.jsx']
    },
    module : {
        loaders : [
          {
            test : /\.jsx?/,
            exclude: /node_modules/,
            loader : 'babel-loader',
            options : {
              presets: ["es2015", "stage-3","react"]
            }
          },
          {
            test: /\.(png|jpg|gif|woff2)$/,
            loader: 'file-loader'
          },
          {
            test: /\.(css|less)$/,
            use: [ 'style-loader', 'css-loader','less-loader' ]
          }
        ]
      },
    devtool: 'inline-source-map',
    plugins: [
      new webpack.NamedModulesPlugin(),
      new HtmlWebpackPlugin({
        title: 'My App',
        filename: 'index.html'
      }),
      new webpack.HotModuleReplacementPlugin()
    ]
  };