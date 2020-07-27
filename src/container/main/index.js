import React, { Component } from "react";
import ReactDOM from "react-dom";
import $ from 'jquery';
import Input from "../../components/input";
import style from './stye.css';
import './app.css';
console.log(style);
class MainContainer extends Component {
  constructor() {
    super();
    this.state = {
      value: ""
    };
    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(event) {
    this.setState({ value : event.target.value });
  }
  render() {
    const { value } = this.state;
    return (
      <div>
        <h2 className={ style.title }>React self custom</h2>
        <h2 className={ 'title' }>React self custom</h2>
        <form id="article-form">
          <Input
            text="SEO title"
            label="seo_title"
            type="text"
            id="seo_title"
            value={ value }
            handleChange={ this.handleChange }
          />
          <p>{ this.state.value }</p>
        </form>
      </div>
    );
  }
}
export default MainContainer;
