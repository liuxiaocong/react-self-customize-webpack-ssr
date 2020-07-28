const webpack = require('webpack');
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const AddAssetHtmlCdnWebpackPlugin = require('add-asset-html-cdn-webpack-plugin');
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const nodeExternals = require('webpack-node-externals');

//not need to use this, MiniCssExtractPlugin already support hmr
const cssLoaderLast = process.env.NODE_ENV === 'development'?
      'style-loader':
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          publicPath: '/css',
          hmr: true,
        },
      }


module.exports = {
  entry: {
    main: path.resolve(__dirname, "../src/ssr.js"),
  },
  output: {
    path: path.resolve(__dirname, '../buildSsr'), //出口文件輸出的路徑
    filename: '[name].js', //出口文件，[name]為入口文件陣列的名稱main喔！
    libraryTarget: 'commonjs2',
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
  target: 'node',
  externals: nodeExternals(),
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '/css',
              hmr: true,
            },
          },
          //'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[path][name]__[local]--[hash:base64:5]',
              },
            },
          }
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[contenthash].[ext]',
              outputPath: 'images',
            },
          },
        ],
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
};
