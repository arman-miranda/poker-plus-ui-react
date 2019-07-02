import React from 'react';
import '../../stylesheets/games_table.css';
import { Link, Redirect } from 'react-router-dom';
import { getDataFromServer, deleteDataFromServer, deleteDataFromWaitingList, requestPUTTo } from '../../shared/request_handlers'
import Cable from 'actioncable';

class GameWaitinglists extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      game_id: this.props.match.params.id,
      waitinglists: "",
      redirectToGameLobby: false,
      game: ""
    }
  }

  componentDidMount() {
    this.fetchWatingLists()
    this.createSocket()
    this.fetchGameData()
  }

  componentWillUnmount() {
    this.app.unsubscribe()
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

  fetchGameData(){
    const data = getDataFromServer(
      `http://localhost:3000/games/${this.state.game_id}`
    )
    data.then(results => {
      if (results.error) {
        this.props.handleUserLogout()
      } else {
        this.setState({ game: results })
      }
    })
  }

  createSocket() {
    let cable = Cable.createConsumer('ws://localhost:3000/cable')
    let gameId = this.props.match.params.id

    this.app = cable.subscriptions.create(
      {
        channel: 'GameWaitinglistChannel',
        game_id: gameId
      },
      {
        connected: () => {},
        received: (data) => {
          if (data.message === "GameWaitinglistUpdated") {
            this.fetchWatingLists()
            this.fetchGameData()
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

  checkIfSeatedPlayer(waitinglist) {
    const { players } = this.state.game
    let seatedPlayer = players.find(player => {
      return player.player_id === waitinglist.player.id
    })
    return !!seatedPlayer
  }

  handleDeletePlayerFromGame(waitinglist){
    const { game_id } = this.state
    const { players } = this.state.game
    let player_game = players.find(player => {
      return player.player_id === waitinglist.player.id
    })
    deleteDataFromWaitingList(`http://localhost:3000/games/${game_id}/player_games/${player_game.player_game_id}`)
  }

  handleAcceptClick(waitinglist, e){
    if(this.checkIfSeatedPlayer(waitinglist)){
      if(window.confirm("This action will change the users seat.")){
        requestPUTTo(`http://localhost:3000/waitinglists/${waitinglist.id}`, {
          player_id: waitinglist.player.id
        })
        this.handleDeletePlayerFromGame(waitinglist)
      }
    } else{
      if(window.confirm("This action will add this user to the game.")){
        requestPUTTo(`http://localhost:3000/waitinglists/${waitinglist.id}`, {
          player_id: waitinglist.player.id
        })
      }
    }
  }

  handleDenyClick(e){
    deleteDataFromServer(`http://localhost:3000/waitinglists/${e.id}`).then(
      window.location.reload()
    )
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
    const { redirectToGameLobby } = this.state
    if(redirectToGameLobby) {
      return <Redirect to={`/games/${this.state.game_id}`} />
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

export default GameWaitinglists;
