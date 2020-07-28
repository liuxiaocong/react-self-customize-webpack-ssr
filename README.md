
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