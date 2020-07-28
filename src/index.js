import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import Main from './container/main';

const wrapper = document.getElementById('create-article-form');
wrapper ? ReactDOM.render(<BrowserRouter><Main/></BrowserRouter>, wrapper) : false;
