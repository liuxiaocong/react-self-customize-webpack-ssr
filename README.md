
##### yarn add style-loader css-loader @babel/core @babel/preset-env @babel/preset-react @babel/preset-react babel-loader html-loader html-webpack-plugin mini-css-extract-plugin prop-types react react-dom
##### mini-css-extract-plugin - This plugin extracts CSS into separate files.
##### SSR yarn add @babel/register @babel/polyfill
##### Build bundle
###### from npm_module vendors~about~main.js page share
###### from npm_module vendors~main.js only main page used

##### SSR
###### Use same webpack to build ssr js, just update libraryTarget: 'commonjs2', target: 'node', externals: nodeExternals(),
###### Separate entry server js and render react js, coz @babel/register not support entry file
###### Change index file to ssr file, export render function
###### Do not use default react config

###### Currently most react ssr solution only support js render, but not support css and image render, in order to implement image and css srr,you need to use webpack to generate server side interface.
###### You can check every commit from this project, step by step, please make star if you like it

###### 1，Base framework and webpack config
###### SRC folder is for front end development，server folder is server side relative，entry file of front end is index.js and about.js（please ignore if it's single app）

![image.png](https://upload-images.jianshu.io/upload_images/2388899-78282499cc98562c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

A look of instructions in package.json：
```
"start": "cross-env NODE_ENV=development webpack-dev-server --open --mode development",
"build": "cross-env NODE_ENV=production webpack --mode production",
"server": "nodemon --exec babel-node server/index.js",
"buildServer": "NODE_ENV=development webpack --config ./server/webpack.server.config.js"
```
######yarn start: Front end code dev.
######yarn build:Front end build with config of webpack.config.js in root path.
######yarn buildServer: Server side relative packing，for css and image resource loading, config file path: /server/webpack.server.config.js
######yarn server: Server start，use and bundle js which build by 'yarn buildServer' path: /buildSsr/main.js.

######Front end project webpack config，support js，css，image loader, packing to /build file.
######webpack.config.js
```
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


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
    main: path.resolve(__dirname, "src/index.js"),
    about: path.resolve(__dirname, "src/about.js")
  },
  output: {
    path: path.resolve(__dirname, 'build'), //出口文件輸出的路徑
    filename: '[name].js' //出口文件，[name]為入口文件陣列的名稱main喔！
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './src/index.html',
      filename: './index.html',
      chunks: ['main'],
    }),
    new HtmlWebPackPlugin({
      template: './src/about.html',
      filename: './about.html',
      chunks: ['about'],
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
  ],
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
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 10000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        default: {
          minChunks: 1,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
};
```
###### Server side render helper webpack config，mostly same as front end，by change the entry and output, make css and image generate the same and front end。
Take care of the below code：
```
target: 'node',
externals: nodeExternals(),
```
It make js can exe on node env，avoid use window object
```
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const nodeExternals = require('webpack-node-externals');

//not need to use this, MiniCssExtractPlugin already support hmr
const cssLoaderLast = process.env.NODE_ENV === 'development' ?
  'style-loader' :
  {
    loader: MiniCssExtractPlugin.loader,
    options: {
      publicPath: '/css',
      hmr: true,
    },
  };

module.exports = {
  entry: {
    main: path.resolve(__dirname, '../src/ssr.js'),
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
          },
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

```

###### 2，Server side start
###### This part and find detail from [https://www.jianshu.com/p/eba973875d22](https://www.jianshu.com/p/eba973875d22)
Entry: index.js
```
import express from 'express';
//import compression from 'compression';
import path from 'path';
import { renderToString } from 'react-dom/server';
//https://www.babeljs.cn/docs/babel-register
require('@babel/register')();

require('@babel/polyfill');
require.extensions['.less'] = () => {
  return;
};
require.extensions['.css'] = () => {
  return;
};
require.extensions['.svg', '.png'] = () => {
  return;
};

const renderReact = require('./renderReact.js');

//const router = express.Router();

const app = express();
//app.use(compression());
renderReact(app);
app.use(express.static(path.resolve(__dirname, '../build/')));

const port = process.env.PORT || 4000;

app.listen(port, function listenHandler() {
  console.info(`Running on ${ port }`);
});
```
######Use express, babel require to make it run on es6 env;
######"babel/register模块改写require命令，为它加上一个钩子。此后，每当使用require加载.js、.jsx、.es和.es6后缀名的文件，就会先用Babel进行转码"：[http://www.ruanyifeng.com/blog/2016/01/babel.html](http://www.ruanyifeng.com/blog/2016/01/babel.html)
######RenderReact.js is the main router logic for server side，the reason why need make with 2 diff js file is because: `babel-register` doesn't process the file it is called from, see [https://stackoverflow.com/a/29425761/1795821](https://links.jianshu.com/go?to=https%3A%2F%2Fstackoverflow.com%2Fa%2F29425761%2F1795821)
```
import React from 'react';
import fs from 'fs';
import { StaticRouter } from 'react-router-dom';
import Main from '../src/container/main';

const render = require('../buildSsr/main').default;
const reactDomServer = require('react-dom/server');
console.log('server start ....');
console.log(render);
const useServerBuildFile = true;
let buildHtml;
module.exports = function(app) {
  const routerArray = ['/', '/todo', 'about'];
  routerArray.forEach((item) => {
    if (useServerBuildFile) {
      app.get(item, render);
    } else {
      app.get(item, (req, res) => {
        const context = {};
        const appHtml = reactDomServer.renderToString(
          <StaticRouter location={ req.url } context={ context }>
            <Main/>
          </StaticRouter>,
        );
        if (!buildHtml) {
          buildHtml = fs.readFileSync('./build/index.html', 'utf8');
        }
        let result = buildHtml.replace('#body', appHtml);
        res.send(result);
      });
    }
  });
};
```
###### render function is from the js file which build by 'yarn buildServer', /buildSsr/main.js，use webpack to packing js and res by same rule as front end，then export an function for server side

###### 3，Entry which from front end, this is core concept of implement
###### Path: /src/ssr.js
```
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import Main from './container/main';
import fs from "fs";
let buildHtml;
export default function render(req, res) {
  const context = {};
  const appString = renderToString(
    <StaticRouter location={ req.url } context={ context }>
      <Main/>
    </StaticRouter>
  );
  if (!buildHtml) {
    buildHtml = fs.readFileSync('./build/index.html', 'utf8');
  }
  let result = buildHtml.replace('#body', appString);
  console.log(appString);
  res.send(result);
};
```
###### For server side it use render function and packing resource same as front end side.