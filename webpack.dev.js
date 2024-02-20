/**
 * Global Imports
*/

const { merge } = require('webpack-merge');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/**
 * Relative Imports
*/

const common = require('./webpack.common.js');

/**
 * Exports
*/

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',

  devServer: {
    host: process.env.DEV_SERVER_HOST || '127.0.0.1',
    port: process.env.DEV_SERVER_PORT || 8080,
    compress: false,
    historyApiFallback: true,
    contentBase: path.resolve(__dirname, 'dist'),
  },

  output: {
    clean: true,
    publicPath: (process.env.DEV_MODE === 'watch') ? (__dirname + '/dist/') : '/',
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        resolve: {
          fullySpecified: false,
        },
      },

      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },

      {
        test: /\.(png|gif|jpe?g)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images',
            },
          },
        ],
      },
      {
        test: /\.css|sass|scss$/,
        exclude: /node_modules|dist/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
          'postcss-loader',
        ],
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].css',
    }),

    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'staging/index.dev.html'),
      filename: 'index.html',
    }),
  ],
});
