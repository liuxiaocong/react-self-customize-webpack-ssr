import React, { Component } from "react";
import ReactDOM from "react-dom";
import $ from 'jquery';
import Input from "../../components/input";
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
      <form id="article-form">
        <Input
          text="SEO title"
          label="seo_title"
          type="text"
          id="seo_title"
          value={value}
          handleChange={this.handleChange}
        />
        <p>{this.state.value}</p>
      </form>
    );
  }
}
export default MainContainer;
