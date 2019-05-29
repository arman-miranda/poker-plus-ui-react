import React from 'react';
import { Link, Redirect } from 'react-router-dom'
import { getDataFromServer } from '../../shared/request_handlers'
import GamesTable from './games_table'

class Games extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      games: [],
      gameID: null
    }
  }

  componentDidMount() {
    this.getAllGamesFromServer()
  }

  getAllGamesFromServer() {
    const data = getDataFromServer('http://localhost:3000/games')
    data.then(results => {
      if (results.error) {
        this.props.handleUserLogout()
      } else {
        this.setState({games: results})
      }
    })
  }

  onFormSubmit(e) {
    e.preventDefault()
    this.setState({gameID: e.target[0].value})
  }

  render() {
    if(this.state.gameID) {
      return <Redirect to={`/games/${this.state.gameID}`} />
    }

    return(
      <div>
        <Link to={`/players/${this.props.currentUser.id}/waitinglists`}>My Waitinglist</Link>
        <form onSubmit={this.onFormSubmit.bind(this)}>
          <h4>
            GameID:
            <input type="number" name="game_id" required={true} min="1"/>
            <input type="submit" value="Join" />
            {this.props.currentUser.is_premium &&
            <input type="button" value="Host Game" />}
          </h4>
        </form>
        <GamesTable {...this.state} />
      </div>
    )
  }
}

export default Games;
