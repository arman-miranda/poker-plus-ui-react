import React from 'react';
import { Redirect } from 'react-router-dom';
import { requestPOSTTo } from '../../shared/request_handlers';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      isAuthenticated: false,
      redirectionLocation: '/games'
    };
  }

  componentDidMount() {
    if (this.props.location.state) {
      this.setState({
        redirectionLocation: this.props.location.state.from.pathname
      })
    }
  }

  onFormSubmit(e) {
    e.preventDefault();
    const url = `http://localhost:3000/authenticate`
    const creds = {
      "username": this.state.username,
      "password": this.state.password
    }

    requestPOSTTo(url, creds)
      .then( response => {this.handleResponse(response)} )
  }

  handleResponse(response) {
    if (response.status === 401) {
      if (window.confirm('Invalid Username or Password')) {
        window.location.reload()
      }
    }
    if (response.status === 200) {
      response.json().then( data => {
        localStorage.setItem('currentUser', JSON.stringify(data))
        this.props.handleUserLogin()
        this.setState({
          isAuthenticated: true
        })
      })
    }
  }

  onFormChange(e) {
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  render() {
    if (this.state.isAuthenticated) {
      return(
        <Redirect
          to={{
            pathname: this.state.redirectionLocation,
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
