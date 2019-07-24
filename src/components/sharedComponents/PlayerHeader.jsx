import React from 'react';
import '../../stylesheets/player_header.css';
import { deleteDataFromServer } from '../../shared/request_handlers';

class PlayerHeader extends React.Component {
  componentDidMount() {
    this.handleClickAnywhereElse()
  }

  handleNameClick(e) {
    e.preventDefault()
    let dropdown = document.getElementsByClassName("player_header-dropdown_div")[0]

    if (dropdown.style.display === "inline-flex") {
      dropdown.style.display = "none"
    } else {
      dropdown.style.display = "inline-flex"
    }
  }

  handleLogoutClick(e) {
    e.preventDefault()
    if (window.confirm('Are you sure you want to logout?')) {
      this.handleLogout()
    }
  }

  handleLogout() {
    localStorage.currentUser = null;
    deleteDataFromServer('http://localhost:3000/logout')
  }

  handleClickAnywhereElse() {
    let dropdown = document.getElementById("player_header-dropdown_div")
    let name_div = document.getElementById("player_header-username_link")
    window.addEventListener('click', (e) => {
      if (dropdown.style.display !== "none") {
        if (e.target !== dropdown && e.target !== name_div) { dropdown.style.display = "none" }
      }
    })
  }

  render() {
    return(
      <div className="player_header">
        <a className="player_header-index_link" href="/" >Poker Plus</a>
        <div className="clearfix">
          <a className="player_header-username_link" id="player_header-username_link" onClick={this.handleNameClick.bind(this)}>{this.props.currentUser.username} ▾</a>
        </div>
        <div className="player_header-dropdown_div" id="player_header-dropdown_div">
          <a href={`/players/${this.props.currentUser.id}/waitinglists`}>Waitinglist</a>
          <a href={`/players/${this.props.currentUser.id}/game_sessions`}>History</a>
          <a href="#" onClick={this.handleLogoutClick.bind(this)}>Logout</a>
        </div>
        <hr />
      </div>
    )
  }
}

export default PlayerHeader;
