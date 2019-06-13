import React from 'react';
import '../../stylesheets/games_table.css';
import { Redirect } from 'react-router-dom';
import {
  getDataFromServer,
  deleteDataFromServer } from '../../shared/request_handlers'
import Cable from 'actioncable';

class PlayerWaitinglists extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      redirectToGameLobby: false,
      player_id: this.props.match.params.id,
      waitinglists: ""
    }
  }

  componentDidMount() {
    this.fetchWatingLists()
    this.createSocket()
  }

  fetchWatingLists() {
    const data = getDataFromServer(
      `http://localhost:3000/players/${this.state.player_id}/waitinglists`
    )
    data.then(results => {
      if (results.error) {
        this.props.handleUserLogout()
      } else {
        this.setState({ waitinglists: results })
      }
    })
  }

  createSocket() {
    let cable = Cable.createConsumer('ws://localhost:3000/cable')
    let playerId = this.props.match.params.id

    this.app = cable.subscriptions.create(
      {
        channel: 'PlayerWaitinglistChannel',
        player_id: playerId
      },
      {
        connected: () => {},
        received: (data) => {
          if (data.message === "PlayerWaitinglistUpdated") {
            this.fetchWatingLists()
          }
        },
      }
    )
  }

  renderTableHeaders() {
    return (
      <thead>
        <tr>
          <th>
            GameID
          </th>
          <th>
            Game Name
          </th>
          <th>
            Preferred Seat
          </th>
          <th>
            # of Players
          </th>
          <th>
            Status
          </th>
          <th>
          </th>
        </tr>
      </thead>
    )
  }

  handleClick(e){
    deleteDataFromServer(`http://localhost:3000/waitinglists/${e.id}`);
  }

  handleGamesLobbyRedirection() {
    this.setState({
      redirectToGameLobby: true
    })
  }

  renderTableBody(){
    if(this.state.waitinglists.length) {
      const waitinglists = this.state.waitinglists
      return (
        <tbody>
          {waitinglists.map( waitinglist => {
              return (
                <tr key={waitinglist.game.id}>
                  <td>{waitinglist.game.id}</td>
                  <td>{waitinglist.game.name}</td>
                  <td>{waitinglist.preferred_seat}</td>
                  <td>{waitinglist.game.player_games.length} / 9</td>
                  <td>{waitinglist.game_is_active ? "Ongoing" : "Waiting"}</td>
                  <td><button onClick={this.handleClick.bind(this, waitinglist)}>Cancel</button></td>
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
    const { redirectToGameLobby } = this.state
    if(redirectToGameLobby) {
      return <Redirect to='/games' />
    }
    return(
      <div>
        <button onClick={this.handleGamesLobbyRedirection.bind(this)}>Go Back to Games</button>
        <table>
          {this.renderTableHeaders()}
          {this.renderTableBody()}
        </table>
      </div>
    )
  }
}

export default PlayerWaitinglists;
