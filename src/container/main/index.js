import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import Form from '../form';
import style from './style.css';

const Todo = ()=>{
  return (
    <div>Todo</div>
  )
}
export default function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul className={style.liWrap}>
            <li>
              <Link to="/">Form</Link>
            </li>
            <li>
              <Link to="/todo">Todo</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
         renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/todo">
            <Todo />
          </Route>
          <Route path="/">
            <Form />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}