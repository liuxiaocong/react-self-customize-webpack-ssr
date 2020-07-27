import React from "react";
import ReactDOM from "react-dom";

const App = ()=>{
  return (
    <h1>About react</h1>
  )
}

const wrapper = document.getElementById("root");
wrapper ? ReactDOM.render(<App />, wrapper) : false;
