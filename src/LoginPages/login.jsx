import React from 'react';
import { Redirect } from 'react-router-dom';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      auth_token: ""
    };
  }

  onFormSubmit(e) {
    e.preventDefault();
    const creds = {
      "username": this.state.username,
      "password": this.state.password
    }

    fetch(`http://localhost:3000/authenticate`,
      {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(creds)
      }
    ).then( response => {this.handleResponse(response)} )
  }

  handleResponse(response) {
    response.json().then( data => {
      this.setState({
        auth_token: data["auth_token"]
      })
    })
  }

  onFormChange(e) {
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  render() {
    if (this.state.auth_token) {
      return(
        <Redirect
          to={{
            pathname: "/games",
            token: this.state.auth_token
          }}
        />
      )
    } else {
      return (
        <div>
          <form id="loginForm" method="post" onSubmit={this.onFormSubmit.bind(this)} >
            <input id="username" autoFocus={true} name="username" required={true} onChange={this.onFormChange.bind(this)} /><br />
            <input id="password" type="password" name="password" onChange={this.onFormChange.bind(this)} required={true} /><br />
            <input type="submit" value="Log In" />
          </form>
        </div>
      )
    }
  }
}

export default Login;
