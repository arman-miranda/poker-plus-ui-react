import React from 'react';
import '../../stylesheets/games_table.css';
import { Link } from 'react-router-dom';
import { getDataFromServer } from '../../shared/request_handlers'

class PlayerWaitinglists extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      player_id: this.props.match.params.id,
      waitinglists: ""
    }
  }

  componentDidMount() {
    this.fetchWatingLists()
  }

  fetchWatingLists() {
    const data = getDataFromServer(
      `http://localhost:3000/players/${this.state.player_id}/waitinglists`
    )
    data.then(results => {
      this.setState({ waitinglists: results })
    })
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
        <div>
          No waitinglists found.
        </div>
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

export default PlayerWaitinglists;
