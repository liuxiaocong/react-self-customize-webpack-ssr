
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

###### 之前做过一次ssr的尝试，但是只能支持到js层面，因为大部分网络的教程只提到了babel的兼容和使用react的renderToString方法解析js，实际上无法兼容资源，如之前文章的操作：
[https://www.jianshu.com/p/eba973875d22](https://www.jianshu.com/p/eba973875d22)


这几天花了大量时间终于折腾出一个完美版本，并且是自己构建的webpack配置（之前失败很可能是因为react自带的webpack太复杂，构建服务端代码时有些细节没处理好）

完整代码上传到了git：[https://github.com/liuxiaocong/react-self-customize-webpack-ssr](https://github.com/liuxiaocong/react-self-customize-webpack-ssr)
下载的话麻烦点个start，每一步的commit都有说明，下面再简单说一下：

###### 1，基本项目结构，webpack配置
项目结构，src目录为前端开发，server目录为服务器相关，入口文件为index.js和about.js（如果是单入口站点可以忽略）

![image.png](https://upload-images.jianshu.io/upload_images/2388899-78282499cc98562c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

看一下package.json里面的指令设置：
```
"start": "cross-env NODE_ENV=development webpack-dev-server --open --mode development",
"build": "cross-env NODE_ENV=production webpack --mode production",
"server": "nodemon --exec babel-node server/index.js",
"buildServer": "NODE_ENV=development webpack --config ./server/webpack.server.config.js"
```
######yarn start: 前端代码开发调试.
######yarn build: 前端代码发布，配置文件为项目根目录下的webpack.config.js.
######yarn buildServer: 服务器相关代码打包，这一步是为了支持资源加载如css和image，配置文件为根目录下server目录的webpack.server.config.js
######yarn server: 服务器启动，这一步引用了yarn buildServer打包生产的ssr.js.

前端工程webpack配置，解析js，css，image，打包到根目录下的build文件夹webpack.config.js
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
再看一下server的webpack配置，跟上面很像，改了入口和输出，保证生产的css和image一致就行。
注意下面2行代码：
```
target: 'node',
externals: nodeExternals(),
```
这是让输出的js可以在node环境运行，否则会变成引用window对象进行挂接，造成错误。
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

###### 2，服务器启动代码
这部分可以看一下之前的文件[https://www.jianshu.com/p/eba973875d22](https://www.jianshu.com/p/eba973875d22)
入口文件是index.js
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
用的是express，babel require是让后续的运行支持es6语法
######babel/register模块改写require命令，为它加上一个钩子。此后，每当使用require加载.js、.jsx、.es和.es6后缀名的文件，就会先用Babel进行转码：[http://www.ruanyifeng.com/blog/2016/01/babel.html](http://www.ruanyifeng.com/blog/2016/01/babel.html)
renderReact.js为主要服务端路由配置，为什么要分开的原因上一篇文章也提过了`babel-register` doesn't process the file it is called from, see [https://stackoverflow.com/a/29425761/1795821](https://links.jianshu.com/go?to=https%3A%2F%2Fstackoverflow.com%2Fa%2F29425761%2F1795821)
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
注意render方法的引用，来源于yarn buildServer生成的ssr.js文件，通过webpack对js和资源进行解析，然后export一个方法给服务器调用

###### 3，前端提供给服务器的入口文件
这个就是核心，src目录下的ssr.js文件，网上其他资料基本没涉及到，很好的一个思路
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
服务器代码引用的就是render函数，同时资源打包和css解析跟原本的前端js一致，因为基本是同一个webpack配置打包出来的。