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
      newUsername: "",
      newEmail: "",
      newPassword: "",
      newPasswordConfirmation: "",
      isAuthenticated: false,
      isPremium: false,
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
    const url = `/authenticate`
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

  onCheckBoxToggle(e){
    this.setState(prevState => ({
      isPremium: !prevState.isPremium
    }));
  }

  checkIfPasswordsMatch(){
    if (this.state.newPassword == this.state.newPasswordConfirmation){
      return true
    }
  }

  onModalSubmit(e) {
    e.preventDefault()
    if (this.checkIfPasswordsMatch()) {
      var url = `http://localhost:3000/players/`
      var body = {
        username: this.state.newUsername,
        email: this.state.newEmail,
        password: this.state.newPassword,
        is_premium: this.state.isPremium
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
    } else {
      alert("Password does not match")
    }
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
              Username:<br /><input id="newUsername" autoFocus={true} name="newUsername" required={true} onChange={this.onModalChange.bind(this)} /><br />
              Email:<br /><input id="newEmail" type="email" name="newEmail" required={true} onChange={this.onModalChange.bind(this)} /><br />
              Password:<br /><input id="newPassword" type="password" name="newPassword" required={true} onChange={this.onModalChange.bind(this)} /><br />
              Confirm Password:<br /><input id="newPasswordConfirmation" type="password" name="newPasswordConfirmation" required={true} onChange={this.onModalChange.bind(this)} /><br />
              <input type="checkbox" id="isPremium" name="isPremium" value="true" onChange={this.onCheckBoxToggle.bind(this)} /> Dealer<br/>
              <input type="submit" value="Register Player" />
            </form>
          </RegisterPlayerModal>
        </div>
      )
    }
  }
}

export default Login;
