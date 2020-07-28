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