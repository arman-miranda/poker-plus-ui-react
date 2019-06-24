import React from 'react';
import { Redirect } from 'react-router-dom';
import { requestPOSTTo } from '../../shared/request_handlers';
import RegisterPlayerModal from "./registerPlayerModal";

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      new_username: "",
      new_email: "",
      new_password: "",
      isAuthenticated: false,
      redirectionLocation: '/games',
      displayModal: false,
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
    e.preventDefault()
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

  showModal() {
    this.setState({ displayModal: !this.state.displayModal })
  }

  onModalChange(e) {
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  onModalSubmit(e) {
    e.preventDefault()
    var url = `http://localhost:3000/players/`
    var body = {
      username: this.state.new_username,
      email: this.state.new_email,
      password: this.state.new_password
    }

    requestPOSTTo(url, body).then(response => {
      if (response.status === 200) {
        const login = `http://localhost:3000/authenticate`

        requestPOSTTo(login, body)
          .then( response => {this.handleResponse(response)} )
      }
      if (response.status === 204) {
        if (window.confirm('Username / Email already taken.')) {
          window.location.reload()
        }
      }
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
            <input type="button" value="Register User" onClick={this.showModal.bind(this)}/>
          </form>
          <RegisterPlayerModal displayModal={this.state.displayModal} onClose={this.showModal.bind(this)}>
            <form id="registerPlayerForm" method="post" onSubmit={this.onModalSubmit.bind(this)} >
              Username:<br /><input id="new_username" autoFocus={true} name="new_username" required={true} onChange={this.onModalChange.bind(this)} /><br />
              Email:<br /><input id="new_email" type="email" name="new_email" required={true} onChange={this.onModalChange.bind(this)} /><br />
              Password:<br /><input id="new_password" type="password" name="new_password" required={true} onChange={this.onModalChange.bind(this)} /><br />
              <input type="submit" value="Register Player" />
            </form>
          </RegisterPlayerModal>
        </div>
      )
    }
  }
}

export default Login;
