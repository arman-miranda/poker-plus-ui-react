import React from 'react';
import '../../stylesheets/games_table.css';
import { Link, Redirect } from 'react-router-dom';
import { getDataFromServer, deleteDataFromServer, requestPUTTo } from '../../shared/request_handlers'

class GameWaitinglists extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      game_id: this.props.match.params.id,
      waitinglists: "",
      redirectToGameLobby: false
    }
  }

  componentDidMount() {
    this.fetchWatingLists()
  }

  fetchWatingLists() {
    const data = getDataFromServer(
      `http://poker-test-api.herokuapp.com/games/${this.state.game_id}/waitinglists`
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
      requestPUTTo(`http://poker-test-api.herokuapp.com/waitinglists/${waitinglist.id}`, {
        player_id: waitinglist.player.id
      })
    }
  }

  handleDenyClick(e){
    deleteDataFromServer(`http://poker-test-api.herokuapp.com/waitinglists/${e.id}`).then(
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
