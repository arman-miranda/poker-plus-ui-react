import React from 'react';
import '../../stylesheets/games_table.css';
import { Link } from 'react-router-dom';
import { getDataFromServer, requestPUTTo } from '../../shared/request_handlers'

class GameWaitinglists extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      game_id: this.props.match.params.id,
      waitinglists: ""
    }
  }

  componentDidMount() {
    this.fetchWatingLists()
  }

  fetchWatingLists() {
    const data = getDataFromServer(
      `http://localhost:3000/games/${this.state.game_id}/waitinglists`
    )
    data.then(results => {
      if (results.error) {
        this.props.handleUserLogout()
      } else {
        this.setState({ waitinglists: results })
      }
    })
  }

  renderTableHeaders() {
    return (
      <thead>
        <tr>
          <th>
            Player Name
          </th>
          <th>
            Preferred Seat
          </th>
          <th>
          </th>
        </tr>
      </thead>
    )
  }

  handleAcceptClick(waitinglist, e){
    if(window.confirm("This action will add this user to the game.")){
      requestPUTTo(`http://localhost:3000/waitinglists/${waitinglist.id}`, {
        player_id: waitinglist.player.id
      })
    }
  }

  handleDenyClick(e){
    fetch(`http://localhost:3000/waitinglists/${e.id}`, { method: "DELETE" }).then(
      window.location.reload()
    )
  }

  renderTableBody(){
    if(this.state.waitinglists.length) {
      const waitinglists = this.state.waitinglists
      return (
        <tbody>
          {waitinglists.map( waitinglist => {
              return (
                <tr key={waitinglist.id}>
                  <td>{waitinglist.player.username}</td>
                  <td>{waitinglist.preferred_seat}</td>
                  <td>
                    <button onClick={this.handleAcceptClick.bind(this, waitinglist)}>Accept</button>
                    <button onClick={this.handleDenyClick.bind(this, waitinglist)}>Deny</button>
                  </td>
                </tr>
              )
            })}
        </tbody>
      )
    } else {
      return (
        <tbody>
          <tr><td>No waitinglists found.</td></tr>
        </tbody>
      )
    }
  }

  render() {
    return(
      <table>
        {this.renderTableHeaders()}
        {this.renderTableBody()}
      </table>
    )
  }
}

export default GameWaitinglists;
