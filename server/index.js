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