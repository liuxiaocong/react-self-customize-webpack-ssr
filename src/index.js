import React from "react";
import ReactDOM from "react-dom";
import Main from "./container/main";

const wrapper = document.getElementById("create-article-form");
wrapper ? ReactDOM.render(<Main />, wrapper) : false;
